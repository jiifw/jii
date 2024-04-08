/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {input} from '@inquirer/prompts';

// classes
import PromptGenerator from '@jii/console/dist/classes/PromptGenerator';

// helpers
import {toString} from '@jii/core/dist/helpers/string';
import {classname} from '@jii/core/dist/helpers/inflector';
import {noDistDir, isDir} from '@jii/core/dist/helpers/path';

/**
 * Generate for 'command' schematic
 */
export default class Command extends PromptGenerator {
  /**
   * @inheritDoc
   */
  public name = 'command';

  /**
   * @inheritDoc
   */
  public value = 'command';

  /**
   * @inheritDoc
   */
  public basePath = __dirname;

  /**
   * @inheritDoc
   */
  packageLabel = 'Command file';

  /**
   * @inheritDoc
   */
  public description = 'Generates a cli command file';

  /**
   * Template files map {templateName: output-file}
   * @protected
   */
  protected filesMap: Record<string, string | null> = {
    '/commands/[name].ts': 'commands/index',
  };

  /**
   * @inheritDoc
   */
  public async prepare(): Promise<void> {
    await super.prepare();

    const inputs: Record<string, string> = {
      id: this.packageId,
      className: classname(this.packageId + 'Command'),
    };

    //<editor-fold desc="Directory alias">
    inputs.basePath = await input({
      message: 'Directory to generate?',
      default: '@app/src/commands',
      async validate(value) {
        if (value.startsWith('@')) {
          if (!/^@\w+(\/\w+)+$/.test(value)) {
            return 'Path should have alias along with directory name (e.g., @alias/directory)';
          }
        }

        const dir = noDistDir(value);

        if (!isDir(dir)) {
          return `Path to the directory should exist: ${dir}`;
        }

        return true;
      },
    });
    inputs.basePath = noDistDir(inputs.basePath);
    //</editor-fold>

    //<editor-fold desc="Command description">
    inputs.description = await input({
      message: 'Command description (e.g., "To do something awesome")',
      default: 'Command description',
      validate(value) {
        if (!toString(value, true)) {
          return 'Command description should be provided';
        }
        return true;
      },
    });
    //</editor-fold>

    const alias = this.packageId[0].toLowerCase();

    //<editor-fold desc="Command alias">
    inputs.alias = await input({
      message: `Command alias (e.g., "${alias}")`,
      default: alias,
      validate(value) {
        if (!toString(value, true)) {
          return 'Alias must be provided';
        }

        if (value.toLowerCase() !== value) {
          return 'Alias must be a lower case string';
        }
        return true;
      },
    });
    //</editor-fold>

    this.setInputs(inputs);
  }

  /**
   * @inheritDoc
   */
  async process(): Promise<void> {
    const variables = this.getInputs();

    const [, template] = Object.entries(this.filesMap)?.[0] || [];

    this.addTemplateFile(
      template,
      this.toOutFilePath(`${this.packageId}.ts`, variables.basePath, true),
      variables,
    );
  }

  /**
   * @inheritDoc
   */
  async finalize(): Promise<void> {
    console.log('Code generation completed');
  }
}
