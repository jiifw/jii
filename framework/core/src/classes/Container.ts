/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import merge from 'deepmerge';

// utils
import {isObject} from '~/helpers/object';

export interface ComponentConfig {
  [name: string | symbol]: any;

  /** Freeze component, cannot flush in future */
  freeze: boolean;
  /** Optional metadata */
  meta: { [name: string | symbol]: any };
}

/**
 * Di container class for managing components
 */
export default class Container {
  /**
   * Internal di registry
   */
  private _registry: Map<string | symbol, any>;

  /**
   * Internal di components configuration
   */
  private _config: Map<string | symbol, any>;

  /**
   * Di constructor
   */
  constructor() {
    this._registry = new Map<string, any>();
    this._config = new Map<string, ComponentConfig>();
  }

  /**
   * Gets default component configuration
   * @private
   */
  private _defaultConfig(): ComponentConfig {
    return {
      freeze: false,
      meta: {},
    };
  }

  /**
   * Gets component configuration
   * @param name - The name of the component
   * @returns Component configuration
   */

  getConfig(name: string | symbol): ComponentConfig {
    if (!this._config.has(name)) {
      return this._defaultConfig();
    }

    return this._config.get(name);
  }

  /**
   * Sets component configuration
   * @param name - The name of the component
   * @param config - Configuration to update
   */
  setConfig(name: string | symbol, config: Partial<ComponentConfig>): void {
    if ('freeze' in config) {
      throw new Error(`Cannot update readonly property 'freeze'`);
    }

    if ('meta' in config && !isObject(config.meta)) {
      throw new Error(`Invalid 'meta' property value, expected object but provided ${typeof config.meta}`);
    }

    this._config.set(name, merge(
      this.getConfig(name),
      config,
    ));
  }

  /**
   * Adds component inside the container
   * @param name - The name of the component
   * @param data - Component instance / data
   * @param [options] - Component configuration
   */
  protected _set(name: string | symbol, data: any, options: Partial<ComponentConfig> = {}) {
    this._registry.set(name, data);
    this._config.set(name, merge(this._defaultConfig(), options));
  }

  /**
   * Memorizes a component asynchronously
   * @param name - The name of the component
   * @param data - Component instance / data / async or sync function output to memoize
   * @param [options] - Component configuration
   * @see For memorizing synchronously, check {@link memoSync memoSync()}
   */
  async memo(name: string | symbol, data: any | (() => any) | (() => Promise<any>), options: Partial<ComponentConfig> = {}): Promise<void> {
    let _data: any = data;

    if ('function' === typeof data) {
      _data = data.constructor.name == 'AsyncFunction'
        ? await (<Function>data)()
        : (<Function>data)();
    }

    this._set(name, _data, options);
  }

  /**
   * Memorizes a component synchronously
   * @param name - The name of the component
   * @param data - Component instance / data / async or sync function output to memoize
   * @param [options] - Component configuration
   * @see For memorizing asynchronously, check {@link memo memo()}
   */
  memoSync(name: string | symbol, data: any | (() => any), options: Partial<ComponentConfig> = {}): void {
    let _data: any = data;

    if ('function' === typeof data) {
      if (data.constructor.name === 'AsyncFunction') {
        throw new Error(`This method does not support async functions, use 'memo()' instead.`);
      }
      _data = (<Function>data)();
    }

    this._set(name, _data, options);
  }

  /**
   * Retrieves a component from the container
   * @param name - The name of the component
   */
  retrieve<T>(name: string | symbol): T {
    if (!this._registry.has(name)) {
      throw new Error(`Unable to retrieve ${name.toString()}`);
    }

    return <T><unknown>this._registry.get(name);
  }

  /**
   * Checks if a component exists in the container
   * @param name - The name of the component
   * @returns True if the component exists, false otherwise
   */
  exists(name: string | symbol): boolean {
    return this._registry.has(name);
  }

  /**
   * Clears components from container
   * @param name - The name of the component to clear
   * @throws Error if the component is read-only
   * @returns True if the component was cleared, false otherwise
   */
  flush(name: string | symbol): boolean {
    if (this._config.get(name)?.freeze) {
      throw new Error(`Flushing failed, You are trying to remove readonly component ${name.toString()}`);
    }

    return this._registry.delete(name) && this._config.delete(name);
  }
}
