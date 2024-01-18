/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import {EventHandler} from '../classes/Event';
import {BehaviorArgs} from '../classes/Behavior';
import {ComponentsDefinition} from './components';

export type PluginDefinition = {
  /**
   * Directory path or alias to the plugin
   * @example App level path
   * '@plugins/my-plugin'
   * @example Package level path
   * '@jii/core'
   */
  path: string;

  /**
   * Main filename (w/o extension) which contains plugin bootstrapper class<br>
   * For example, `'index'` or `'MyPluginFile'` *(it will automatically resolve the file extension)*
   */
  file?: string;

  /**
   * The unique plugin alias (without @ symbol) to register in root level aliases<br>
   * If not set, the plugin *id* will be used as alias,<br>
   * By using `Jii.getAlias('@[id]')`, you can get the plugin's base path
   * @see {@link path}
   */
  alias?: string;

  /**
   * Disable plugin functionality, false to enable.
   * @default false
   */
  disabled?: boolean;

  /**
   * Allow support for CLI commands (commands/*.ts)
   */
  commands?: boolean;

  /**
   * Plugin additional configuration
   */
  config?: Record<string, any>;

  /**
   * Components to attach with the application
   */
  components?: ComponentsDefinition;

  /**
   * Plugin events to register
   */
  [event: `on ${string}`]: EventHandler;

  /**
   * Plugin behaviors to attach with
   */
  [behavior: `as ${string}`]: BehaviorArgs;

  /**
   * Additional properties
   */
  [prop: string]: any;
}

export interface PluginsDefinition {
  [id: string]: PluginDefinition;
}

/**
 * A plugin wrapper class to create server plugins
 */
export interface ServerPluginMetadata {
  /** Bare-minimum version of Fastify for your plugin, just add the semver range that you need. */
  fastify?: string,
  /** Decorator dependencies for this plugin */
  decorators?: {
    fastify?: (string | symbol)[],
    reply?: (string | symbol)[],
    request?: (string | symbol)[]
  },
  /** The plugin dependencies */
  dependencies?: string[],
  encapsulate?: boolean
}
