/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import merge from 'deepmerge';

// classes
import ConfigValidator from '../../classes/ConfigValidator';
import InvalidConfigError from '../../classes/InvalidConfigError';
import {Schema, PropertyPath} from '../../classes/ConfigValidator';

// utils
import Jii from '../../Jii';
import {isPath} from '../../helpers/path';
import {readSchemaFile, resolveMainFile} from '../../helpers/file';

// types
import {PluginsDefinition} from '../../typings/plugin';

/**
 * Validate and register plugins into to the application
 */
export default class PluginsConfigValidator extends ConfigValidator {
  /**
   * @inheritDoc
   */
  public propertyName(): PropertyPath | PropertyPath[] {
    return 'plugins';
  }

  /**
   * @inheritDoc
   */
  async getSchema(): Promise<Schema | null> {
    return readSchemaFile('@jiiRoot/schemas/plugin');
  }

  /**
   * @inheritDoc
   */
  async validate(): Promise<void> {
    const definitions = this.getConfig() as unknown as PluginsDefinition;
    const plugins = Object.entries(definitions);

    if (!plugins.length) {
      return;
    }

    for (const [id, def] of plugins) {
      const config = merge({file: 'index'} as unknown as PluginsDefinition, def);
      const _path = resolveMainFile(config.path, config.file);

      if (!isPath(_path.dir, 'dir')) {
        throw new InvalidConfigError(`Plugin '${id}' path '${config.path}' must be a valid directory`);
      }

      if (!isPath(_path.path, 'file')) {
        throw new InvalidConfigError(`Plugin '${id}' file '${config.file}' must be a valid file`);
      }
    }
  }

  /**
   * @inheritDoc
   */
  async apply(): Promise<void> {
    const plugins = this.getConfig() as unknown as PluginsDefinition;

    if (Object.keys(plugins).length) {
      Jii.plugins.setPlugins(plugins, false);
    }
  }
}
