/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import objPath from 'object-path';
import merge from 'deepmerge';

// classes
import ConfigValidator from '../../classes/ConfigValidator';
import ConfigurationEvent from '../../classes/ConfigurationEvent';
import Application from '../../classes/Application';

// utils
import {isPlainObject} from '../../helpers/object';

// types
import {Schema, PropertyPath} from '../../classes/ConfigValidator';
import {ComponentDefinition} from '../../typings/components';

/**
 * Validate and process application components
 */
export default class ComponentsConfigValidator extends ConfigValidator {
  /**
   * @inheritDoc
   */
  public propertyName(): PropertyPath | PropertyPath[] {
    return 'components';
  }

  /**
   * @inheritDoc
   */
  async getSchema(): Promise<Schema | null> {
    return {
      'type': 'object',
      'additionalProperties': {
        'type': 'object',
        'properties': {
          'class': {
            'type': 'string',
            'description': 'Class object or a path',
            'minLength': 3,
          },
        },
        'additionalProperties': true,
        'patternProperties': {
          '^(on|as) [a-z]+([A-Z][a-z]+)*$': {},
          '^[a-z]+([A-Z][a-z]+)*$': {},
        },
        'required': [
          'class',
        ],
      },
      'propertyNames': {
        'pattern': '^[a-z]+([A-Z0-9][a-z0-9]+)*$',
      },
    };
  }

  /**
   * @inheritDoc
   */
  async beforeProcess() {
    let config = this.getConfig();

    const defaultComponentConfig: ComponentDefinition = {
      platform: 'web',
    };

    if (!isPlainObject(config)) {
      config = {} as any;
    }

    for (const key in config) {
      config[key] = merge(defaultComponentConfig, config[key]);
      if (config[key].platform !== this.getApp().platform) {
        delete config[key];
      }
    }

    const coreComponents = this?.getApp()?.coreComponents() || {};

    // merge core components with custom components
    for (const [id, component] of Object.entries(coreComponents)) {
      if (!objPath.has(config, id)) {
        config[id] = component;
      } else if (isPlainObject(config[id]) && !objPath.has(config, [id, 'class'])) {
        objPath.set(config, [id, 'class'], component['class']);
      }
    }

    this.setConfig(config);
  }

  /**
   * @inheritDoc
   */
  async apply(): Promise<void> {
    this.getApp().on(Application.EVENT_BEFORE_FINALIZE_CONFIG, (event) => {
      const components = (event as ConfigurationEvent)?.config?.components;
      if ( components ) {
        (event.sender as Application).setComponents(components);
      }
    });
  }
}
