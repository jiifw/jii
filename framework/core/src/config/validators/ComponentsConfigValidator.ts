/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import merge from 'deepmerge';
import objPath from 'object-path';

// classes
import Application from '../../classes/Application';
import ConfigValidator from '../../classes/ConfigValidator';
import ConfigurationEvent from '../../classes/ConfigurationEvent';

// utils
import {isPlainObject} from '../../helpers/object';

// schemas
import componentsSchema from '../../schemas/components.schema';

// types
import {ComponentDefinition} from '../../typings/components';
import {Schema, PropertyPath} from '../../classes/ConfigValidator';

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
    return componentsSchema;
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
