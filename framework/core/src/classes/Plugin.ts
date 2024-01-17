/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Component from './Component';
import PluginEvent from './PluginEvent';

/**
 * The plugin types
 */
export const PLUGIN_TYPES = ['server', 'config', 'request', 'response', 'cli', 'silent'] as const;

export type PluginType = typeof PLUGIN_TYPES[number];

/**
 * A plugin class to create server plugins
 */
export default abstract class Plugin extends Component {
  /**
   * @event PluginEvent
   * An event raised right before executing a plugin register.
   *
   * You may set {@link PluginEvent#isValid PluginEvent.isValid} to be false to cancel the plugin execution.
   */
  public static EVENT_BEFORE_REGISTER: string = 'beforeRegister';

  /**
   * @event PluginEvent
   * An event raised right after executing a plugin registered.
   */
  public static EVENT_AFTER_REGISTER: string = 'afterRegister';

  /**
   * The unique plugin id, e.g., cors, body-parser, etc.
   */
  public id: Lowercase<string> = null;

  /**
   * The plugin directory
   */
  public basePath: string = null;

  /**
   * The plugin description
   */
  public description: string = null;

  /**
   * The plugin version
   */
  public version: string = '1.0';

  /**
   * Plugin type
   */
  public type: PluginType = 'silent';

  /**
   * The plugin handler
   */
  async handler(): Promise<void> {
    throw new Error('Plugin handler implementation is required');
  }

  /**
   * Trigger event before the plugin register
   */
  async beforeRegister(): Promise<boolean> {
    const event = new PluginEvent();
    await this.trigger(Plugin.EVENT_BEFORE_REGISTER, event);
    return event.isValid;
  }

  /**
   * Trigger event after the plugin register
   */
  async afterRegister(): Promise<any> {
    const event = new PluginEvent();
    await this.trigger(Plugin.EVENT_AFTER_REGISTER, event);
    return event.result;
  }
}
