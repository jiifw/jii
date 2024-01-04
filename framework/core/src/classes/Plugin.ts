/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import merge from 'deepmerge';

// utils
import Jii from '../Jii';

// classes
import Component from './Component';

// types
import {importPluginConfig} from '../base/config';

/**
 * A plugin wrapper class to create server plugins
 */
export interface PluginMetadata {
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

/**
 * A plugin class to create server plugins
 */
export default abstract class Plugin extends Component {
  /**
   * The unique plugin id, e.g., cors, body-parser, etc.
   */
  public id: Lowercase<string>;

  /**
   * The plugin name, e.g., plugin-cors, plugin-body-parser, etc.<br>
   * **Note**: It will register in the plugin registry with the same name
   */
  public name: Lowercase<string>;

  /**
   * The plugin description
   */
  public description: string = null;

  /**
   * Reads the plugin config file (app), also merge supplied options with the plugin config
   * @param [options] - The plugin options
   * @returns The plugin config
   */
  async getConfig<T = Record<string, any>>(options: T | { [key: string]: any } = {}): Promise<T> {
    return importPluginConfig<T>(this.id, Jii.app().server, merge(<T>this.config, <T>options));
  };

  /**
   * The plugin constructor
   * @param [config] - Plugin configuration
   */
  constructor(private readonly config: { [name: string]: any } = {}) {
    super({});

    /*if (!toString(this.id, true)) {
      throw new Error('Plugin id is required');
    }

    if (!toString(this.name, true)) {
      throw new Error('Plugin name is required');
    }*/
  }

  /**
   * Returns the metadata for the plugin
   */
  metadata(): Partial<PluginMetadata> {
    return {};
  }

  /**
   * The plugin handler
   */
  async handler(): Promise<void> {
    throw new Error('Plugin handler implementation is required');
  }

  /**
   * Trigger event before the plugin register
   */
  async beforeRegister(): Promise<void> {
  }

  /**
   * Trigger event after the plugin register
   */
  async afterRegister(): Promise<void> {
  }
}
