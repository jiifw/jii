/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {sync} from 'glob';
import {normalize, sep} from 'path';

// classes
import ConfigValidator from '@jii/core/dist/classes/ConfigValidator';

// utils
import Jii from '@jii/core/dist/Jii';
import {wrap} from '@jii/core/dist/helpers/array';
import {isPath, trimSlashes, createDir, noDistDir} from '@jii/core/dist/helpers/path';

// types
import {ConsoleDirectory} from '@jii/core/dist/typings/app-config';
import {Schema, PropertyPath} from '@jii/core/dist/classes/ConfigValidator';
import {ApplicationConfig} from '../../typings/app-config';

/**
 * Validate and process console configuration
 */
export default class ConsoleConfigValidator extends ConfigValidator {
  /**
   * @inheritDoc
   */
  public propertyName(): PropertyPath | PropertyPath[] {
    return 'console';
  }

  /**
   * Validates console 'dirs' existence
   * @param [dir] - Directory path to validate
   * @param [recursive] - Recursively find
   * @protected
   */
  protected resolvePath(dir: string, recursive: boolean = false): Array<string> {
    const path = trimSlashes(normalize(Jii.getAlias(dir, false)));

    const newDirPath = isPath(path, 'dir');

    if ( !newDirPath ) createDir(path);

    if (!newDirPath) {
      throw new Error(`${path} must be a valid directory`);
    }

    if (!recursive) {
      return [path + sep + 'commands'];
    }

    return [...sync('**/commands', {cwd: path, absolute: true})]
      .map(p => trimSlashes(normalize(p)));
  };

  /**
   * Normalizes console 'dirs' to array of paths
   * @param [definition] - Dirs definition to validate
   * @protected
   */
  protected normalizeDirs(definition: ConsoleDirectory): Array<string> {
    const list: ConsoleDirectory[] = ['@app']; // predefined directories
    list.push(...wrap(definition));

    const directories: Array<string> = [];

    for (const element of list) {
      if (typeof element === 'string') {
        directories.push(...this.resolvePath(element, false));
      }

      if (typeof element === 'object') {
        const {path, recursive} = element as { path: string; recursive: boolean };
        directories.push(...this.resolvePath(path, recursive));
      }
    }

    return [...new Set(directories)]; // unique filter, clean up duplicates
  };

  /**
   * @inheritDoc
   */
  async getSchema(): Promise<Schema | null> {
    return {
      type: 'object',
      additionalProperties: false,
      properties: {
        dirs: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                },
                recursive: {
                  type: 'boolean',
                },
              },
              required: ['path', 'recursive'],
              additionalProperties: false,
            },
            {
              type: 'array',
              items: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'object',
                    properties: {
                      path: {
                        type: 'string',
                      },
                      recursive: {
                        type: 'boolean',
                      },
                    },
                    required: ['path', 'recursive'],
                    additionalProperties: false,
                  },
                ],
              },
            },
          ],
        },
      },
    };
  }

  /**
   * @inheritDoc
   */
  async apply(): Promise<void> {
    const config = this.getConfig() as ApplicationConfig['console'];
    config.dirs = this.normalizeDirs(config.dirs);
    this.setConfig(config as ApplicationConfig);
  }
}
