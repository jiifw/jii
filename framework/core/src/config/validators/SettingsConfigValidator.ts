/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import ConfigValidator from '../../classes/ConfigValidator';
import InvalidConfigError from '../../classes/InvalidConfigError';
import Application from '../../classes/Application';

// utils
import {isPath, resolve} from '../../helpers/path';
import {isPlainObject} from '../../helpers/object';
import {invokeModuleMethod} from '../../helpers/file';

// types
import {Schema, PropertyPath} from '../../classes/ConfigValidator';

/**
 * Validate and apply the aliases, params and bootstrapper configuration to the application
 */
export default class SettingsConfigValidator extends ConfigValidator {
  /**
   * @inheritDoc
   */
  public propertyName(): PropertyPath | PropertyPath[] {
    return [
      'bootstrap',
      'aliases',
      'params',
    ];
  }

  /**
   * @inheritDoc
   */
  async getSchema(): Promise<Schema> {
    return {
      type: 'object',
      properties: {
        bootstrap: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          ],
        },
        aliases: {
          type: 'object',
          additionalProperties: {
            type: 'string',
          },
          propertyNames: {
            pattern: '^[a-z]+([A-Z][a-z]+)*$',
          },
        },
        params: {
          type: 'object',
          additionalProperties: {
            type: 'string',
          },
          propertyNames: {
            pattern: '^[a-z]+([A-Z][a-z]+)*$',
          },
        },
      },
    };
  }

  /**
   * @inheritDoc
   */
  async validate(): Promise<void> {
    this.bootstrapsValidator(this.getConfig()?.bootstrap);
  }

  /**
   * @inheritDoc
   */
  async apply(): Promise<void> {
    const config = this.getConfig();

    // register aliases
    if (config?.aliases) {
      this.getApp().setAliases(config.aliases);
      delete config.aliases;
    }

    if (isPlainObject(config?.params)) {
      this.getApp().params = config.params;
      delete config.params;
    }

    this.setConfig(config);

    // register events
    this.getApp().on(Application.EVENT_BEFORE_FINALIZE_CONFIG, async () => {
      await this.invokeBootstraps();
    });
  }

  /**
   * Invoke bootstrapper files<br>
   * If you override this method, please make sure you call the parent implementation.
   */
  protected async invokeBootstraps(): Promise<void> {
    // memorize the configuration for future reference and usage
    const bootstrap = this.getConfig()?.bootstrap || [];
    const list = Array.isArray(bootstrap) ? bootstrap : [bootstrap];

    if (!list.length) return;

    await Promise.all(
      list.map(path => invokeModuleMethod(path, 'default')),
    );
  };

  /**
   * Validates and verify the bootstrapper filers
   * @param [bootstrap] - bootstrap file(s)
   */
  protected bootstrapsValidator(bootstrap: string | string[]): void {
    if (!bootstrap) {
      return;
    }

    const list = Array.isArray(bootstrap) ? bootstrap : [bootstrap];
    for (const file of list) {
      try {
        if (!isPath(resolve(file), 'file')) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error('Trap error');
        }
      } catch (e) {
        throw new InvalidConfigError(`File '${file}' is not found in a 'bootstrap', File must be a valid file`);
      }
    }
  };
}
