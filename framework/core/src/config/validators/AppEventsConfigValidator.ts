/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import ConfigValidator from '../../classes/ConfigValidator';

// types
import {Schema, PropertyPath} from '../../classes/ConfigValidator';

/**
 * Validate and apply the events/behaviors to the application
 */
export default class AppEventsConfigValidator extends ConfigValidator {
  /**
   * @inheritDoc
   */
  public propertyName(): PropertyPath | PropertyPath[] {
    return Object.keys(this.getConfig())
      .filter(prop => {
        return prop.startsWith('as ')
          || prop.startsWith('on ');
      });
  }

  /**
   * @inheritDoc
   */
  async getSchema(): Promise<Schema | null> {
    return {
      type: 'object',
      patternProperties: {
        '^(on|as) [a-z]+([A-Z][a-z]+)*$': {},
      },
    };
  }

  /**
   * @inheritDoc
   */
  async apply(): Promise<void> {
    const list = Object.entries(this.getConfig());
    if (!list.length) {
      return;
    }
    for (const [prop, handler] of list) {
      const [type, name] = prop.split(' ');

      if (type.toLowerCase() === 'as') {
        this.getApp().attachBehavior(name, handler);
      } else if (type.toLowerCase() === 'on') {
        this.getApp().on(name, handler);
      }
    }
  }
}
