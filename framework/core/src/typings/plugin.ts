/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import {Class} from 'utility-types';
import {EventHandler} from '../classes/Event';
import {BehaviorArgs} from '../classes/Behavior';

export type PluginType = 'server' | 'config' | 'request' | 'response' | 'cli' | 'none';

export type PluginDefinition = {
  /**
   * Class path, Object
   */
  class: string | Class<any>;
  /**
   * Platform to target components for.
   */
  type?: PluginType;
  /**
   * Enable plugin functionality, false to disable.
   */
  enabled?: boolean;
  /**
   * Allow support for CLI commands (commands/*.ts)
   */
  commands?: boolean;

  [event: `on ${string}`]: EventHandler;
  [behavior: `as ${string}`]: BehaviorArgs;
  [prop: string]: any;

  /**
   * Plugin additional configuration
   */
  config?: Record<string, any>;
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
