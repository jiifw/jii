/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Component, {EventHandler as ComponentEventHandler} from './Component';

/**
 * The plugin types
 */
export const PLUGIN_TYPES = ['server', 'config', 'request', 'response', 'cli', 'silent'] as const;

export type PluginType = typeof PLUGIN_TYPES[number] | string;
export type EventHandler = ComponentEventHandler;

/**
 * A base plugin class to create application specific plugins
 */
export default abstract class Plugin extends Component {
  /**
   * @event PluginAppEvent
   * An event raised while application is being initialized
   *
   * You may seek {@link PluginAppEvent#app PluginAppEvent.app} to be change behavior of the application instance
   */
  public static EVENT_BEFORE_APP_INIT: string = 'beforeAppInit';

  /**
   * @event PluginAppEvent
   * An event raised while application is preparing to run
   *
   * You may seek {@link PluginAppEvent#app PluginAppEvent.app} to be change behavior of the application instance
   */
  public static EVENT_BEFORE_APP_RUN: string = 'beforeAppRun';

  /**
   * @event PluginAppConfigEvent
   * An event raised right before the application config is preparing
   *
   * You may seek {@link PluginAppConfigEvent#config PluginAppConfigEvent.config} to modify the application configuration before preparing
   */
  public static EVENT_BEFORE_CONFIG_PROCESS: string = 'beforeConfigProcess';

  /**
   * @event PluginAppConfigEvent
   * An event raised right after the application  config is finalized
   *
   * You may seek {@link PluginAppConfigEvent#config PluginAppConfigEvent.config} to modify the application configuration after finalized
   */
  public static EVENT_AFTER_CONFIG_PROCESS: string = 'afterConfigProcess';

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
   * Returns the list of core validators for the plugin
   *
   * It will inject the validators into application core validators at runtime
   *
   * @example
   * [
   *   '@jiiRoot/config/validators/CoreConfigValidator',
   *   ...,
   * ]
   */
  public configValidators(): string[] {
    return [];
  }

  /**
   * Declares event handlers for the {@link owner}'s events.
   *
   * Child classes may override this method to declare what callbacks should
   * be attached to the events of the {@link owner} plugin.
   *
   * The callbacks can be any of the following:
   *
   * 1. <code style="color:#B87333">async (event: Event, data: any): Promise<void> => { ... }</code> // Anonymous async function
   * 2. <code style="color:#B87333">(event: Event, data: any): void => { ... }</code> // Anonymous sync function
   * 3. <code style="color:#B87333">[instance, 'handleAdd']</code> // object method
   * 4. <code style="color:#B87333">[Page, 'handleAdd']</code> // static class method
   * 4. <code style="color:#B87333">['@app/classes/Page', 'handleAdd']</code> // alias based class path
   * 6. <code style="color:#B87333">'handleAdd'</code> // global function
   *
   * The following is an example:
   *
   * ```
   * {
   *     [Plugin.EVENT_BEFORE_REGISTER]: 'beforeRegister',
   *     [Plugin.EVENT_AFTER_REGISTER]: 'afterRegister',
   * }
   * ```
   *
   * @returns events (object keys) and the corresponding event handler methods (object values).
   */
  public events(): Record<string, EventHandler> {
    return {};
  }
}
