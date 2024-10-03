/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import ConfigValidator from '~/classes/ConfigValidator';

// utils
import componentsSchema from '~/schemas/components.schema';

// types
import {ModulesDefinition} from '~/typings/modules';
import {PropertyPath, Schema} from '~/classes/ConfigValidator';
import {ApplicationConfig} from '~/typings/app-config';

/**
 * Validate and process application modules
 */
export default class ModulesConfigValidator extends ConfigValidator {
  /**
   * @inheritDoc
   */
  public propertyName(): PropertyPath | PropertyPath[] {
    return 'modules';
  }

  /**
   * @inheritDoc
   */
  async getSchema(): Promise<Schema | null> {
    return {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          class: {
            type: 'string',
            description: 'Class object or a path',
            minLength: 3,
          },
          components: componentsSchema,
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
        additionalProperties: true,
        patternProperties: {
          '^(on|as) [a-z]+([A-Z][a-z]+)*$': {},
          '^[a-z]+([A-Z][a-z]+)*$': {},
        },
        required: [
          'class',
        ],
      },
      propertyNames: {
        pattern: '^[a-z]+([A-Z0-9][a-z0-9]+)*$',
      },
    };
  }

  /**
   * @inheritDoc
   */
  async beforeProcess(): Promise<void> {
    const modules = this.getConfig() as unknown as ApplicationConfig['modules'];

    if ( modules && Object.keys(modules).length ) {
      this.getApp().setModules(modules as ModulesDefinition);
    }

    this.setConfig(modules as unknown as ApplicationConfig);
  }
}
