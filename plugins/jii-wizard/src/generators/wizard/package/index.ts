/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {valid} from 'semver';
import {normalize} from 'node:path';
import {input, select} from '@inquirer/prompts';

// classes
import PromptGenerator from '@jii/console/dist/classes/PromptGenerator';

// utils
import Jii from '@jii/core/dist/Jii';
import {isDir} from '@jii/core/dist/helpers/path';
import {toString} from '@jii/core/dist/helpers/string';
import {classname} from '@jii/core/dist/helpers/inflector';

/**
 * Generate for 'plugin' schematic
 */
export default class Plugin extends PromptGenerator {
  /**
   * @inheritDoc
   */
  public name = 'package';

  /**
   * @inheritDoc
   */
  public value = 'package';

  /**
   * @inheritDoc
   */
  public basePath = __dirname;

  /**
   * @inheritDoc
   */
  public description = 'Generates a jii package with the minimal structure';

  /**
   * Template files map {templateName: output-file}
   * @protected
   */
  protected filesMap: Record<string, string | string[]> = {
    'package': '/package.json',
    'babelrc': '/.babelrc.json',
    'gitignore': '/.gitignore',
    'jest.config': '/jest.config.js',
    'src/index': '/src/index.ts',
    'src/types': '/src/types.ts',
    'src/commands/gitkeep': '/src/commands/.gitkeep',
  };

  /**
   * @inheritDoc
   */
  public async prepare(): Promise<void> {
    // set base path
    this.basePath = __dirname;

    await super.prepare();

    this.packageId = this.packageId.replace(/^jii-/i, '');

    const inputs: Record<string, string> = {
      id: this.packageId,
      className: classname(this.packageId + 'Plugin'),
    };

    // change package name
    this.packageId = 'jii-' + this.packageId;

    //<editor-fold desc="Directory alias">
    inputs.basePath = await input({
      message: 'Directory to generate?',
      default: '@app/packages',
      async validate(value) {
        if (value.startsWith('@')) {
          if (!/^@\w+(\/\w+)+$/.test(value)) {
            return 'Path should have alias along with directory name (e.g., @alias/directory)';
          }
        }

        const dir = normalize(Jii.getAlias(value));

        if (!isDir(dir)) {
          return `Path to the directory should exist: ${dir}`;
        }

        return true;
      },
    });
    //</editor-fold>

    //<editor-fold desc="package version">
    inputs.version = await input({
      message: 'Package version (e.g., "1.0" or "1.0.1-beta")',
      default: '1.0.0',
      validate(value) {
        if (!toString(value, true)) {
          return 'Package version should be provided';
        }
        if (!valid(value)) {
          return 'Invalid package version, should follow semantic versioning';
        }
        return true;
      },
    });
    //</editor-fold>

    //<editor-fold desc="package id">
    inputs.description = await input({
      message: 'Package description (e.g., "Authorization package" or "Access token package")',
      default: 'Package description',
      validate(value) {
        if (!toString(value, true)) {
          return 'Package description should be provided';
        }
        return true;
      },
    });
    //</editor-fold>

    //<editor-fold desc="package target platform">
    inputs.target = await select({
      message: 'Target platform (web or console)',
      choices: [{name: 'web', value: 'web'}, {name: 'console', value: 'console'}],
      default: 'web',
    });
    //</editor-fold>

    this.setInputs(inputs);
  }

  /**
   * @inheritDoc
   */
  async process(): Promise<void> {
    const variables = this.getInputs();

    for (const [template, path] of Object.entries(this.filesMap)) {
      let outFile = path;
      if (Array.isArray(path)) {
        outFile = path[0];

        if (variables.target !== path[1]) continue;
      }

      this.addFile(
        template,
        this.resolveOutFile(outFile as string, variables.basePath),
        variables,
      );
    }
  }
}
