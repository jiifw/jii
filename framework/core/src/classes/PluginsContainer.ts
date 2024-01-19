/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import merge from 'deepmerge';
import {join, normalize} from 'node:path';

// classes
import Plugin, {EventHandler} from './Plugin';
import Instance from './Instance';
import Component from './Component';
import BaseObject from './BaseObject';
import Configuration from './Configuration';
import InvalidCallError from './InvalidCallError';
import InvalidConfigError from './InvalidConfigError';

// utils
import Jii from '../Jii';
import {readSchemaFile, resolveMainFile} from '../helpers/file';
import {isPlainObject} from '../helpers/object';

// types
import {Class} from 'utility-types';
import {PluginDefinition, PluginsDefinition} from '../typings/plugin';
import {isSyncFunction} from '../helpers/function';
import InvalidArgumentError from './InvalidArgumentError';

export type PluginAttributes = {
  [name: string | symbol]: any;
}

export type PluginMetadataType =
  | 'events' | 'disabled' | 'components'
  | 'config' | 'instance' | 'base-path'
  | 'version' | 'commands';

/**
 * Plugins registrar container
 */
export default class PluginsContainer extends BaseObject {
  /**
   * Plugin definitions indexed by their IDs
   */
  protected _definitions: Map<string, PluginDefinition> = new Map();

  /**
   * Plugin instances indexed by their IDs
   */
  protected _plugins: Map<string, InstanceType<typeof Plugin>> = new Map();

  /**
   * Plugin attributes indexed by their IDs
   */
  protected _attributes: Map<string, Map<string | symbol, any>> = new Map();

  /**
   * Returns the list of the plugin definitions or the loaded plugin instances.
   * @param [returnDefinitions] - Whether to return plugin definitions instead of the loaded plugin instances.
   * @return The list of the plugin definitions or the loaded plugin instances (ID: definition or instance).
   */
  public getPlugins(returnDefinitions: boolean = true): { [p: string]: any } {
    return Object.fromEntries(
      returnDefinitions
        ? this._definitions.entries()
        : this._plugins.entries(),
    );
  }

  /**
   * Initializes the plugin instance
   * @param id - Plugin ID (e.g. `myPlugin`).
   * @param definition - Plugin definition
   * @return The plugin instance
   * @protected
   */
  protected createInstance(id: string, definition: PluginDefinition): InstanceType<typeof Plugin> {
    const def: PluginDefinition = merge({
      file: 'index',
      commands: true,
      disabled: false,
      alias: id,
      config: {},
      components: {},
    }, definition);

    const _path = resolveMainFile(def.path, def.file);
    const PluginClass = Instance.classFromPath<Class<Plugin>>(_path.path);
    const plugin = new PluginClass(def.config);
    plugin.basePath = _path.dir;

    if (!plugin?.id) {
      plugin.id = id as Lowercase<string>;
    }

    for (const [eventName, handler] of Object.entries(Instance.eventsOf(def))) {
      plugin.on(eventName, handler);
    }

    for (const [name, behavior] of Object.entries(Instance.behaviorsOf(def))) {
      plugin.attachBehavior(name, behavior);
    }

    if (Object.keys(def.components).length) {
      Jii.app().setComponents(def.components);
    }

    Jii.setAlias(def.alias, plugin.basePath);
    this.setAttribute(id, 'allowCommands', def.commands as boolean);
    this.setAttribute(id, 'disabled', def.disabled);

    return plugin;
  }

  /**
   * Get all registered plugins metadata
   *
   * **Note**: This method with intentionally load all the plugins from present definitions, if the following fields are requested:<br>
   * `'events', 'instance', 'base-path', 'version'`
   *
   * @param fields - Metadata fields to retrieve
   * @param [returnDisabled] - True to return disable, false to return on enabled
   * @param [callback] - True to return disable, false to return on enabled
   * @returns Registered plugins metadata
   */
  public pluginsMetadata(
    fields: PluginMetadataType[],
    returnDisabled: boolean = false,
    callback: (definition: PluginDefinition, plugin: Plugin,
    ) => any = undefined): Record<string, { [field: PluginMetadataType | string]: any }> {
    if (!this._definitions.size) {
      return {};
    }

    if (callback && !isSyncFunction(callback)) {
      throw new InvalidArgumentError(`The 'callback' argument must be a sync function`);
    }

    const list: Record<string, { [field: PluginMetadataType | string]: any }> = {};

    for (const [pluginId, definition] of this._definitions.entries()) {
      const disabled = this.checkDisabled(pluginId);

      if (disabled && !returnDisabled) {
        continue;
      }

      const metadata: { [field: PluginMetadataType | string]: any } = {};

      if (fields.includes('disabled')) {
        metadata['disabled'] = disabled;
      }

      if (fields.includes('components')) {
        metadata['components'] = definition.components;
      }

      if (fields.includes('commands')) {
        metadata['commands'] = this.getAttribute(pluginId, 'allowCommands');
      }

      if (fields.includes('config')) {
        metadata['config'] = definition.config;
      }

      const instance = this.get<Plugin>(pluginId);

      if (fields.includes('instance')) {
        metadata['instance'] = instance;
      }

      if (fields.includes('events')) {
        metadata['events'] = instance.events();
      }

      if (fields.includes('base-path')) {
        metadata['base-path'] = instance.basePath;
      }

      if (fields.includes('version')) {
        metadata['version'] = instance.version;
      }

      if (callback) {
        metadata['custom'] = callback(definition, instance);
      }

      list[pluginId] = metadata;
    }

    return list;
  }

  /**
   * Get all plugins event-handler by the given event name
   *
   * **Note**: This method with intentionally load all the plugins from present definitions
   *
   * @param eventName - The plugin event name
   * @param [returnDisabled] - True to return disable, false to return on enabled
   * @returns Plugins event *{pluginId: EventHandler, ...}*
   * @see {@link pluginsMetadata pluginsMetadata()}
   */
  public getPluginsEvent(eventName: string, returnDisabled: boolean = false): { [id: string]: EventHandler } {
    const pluginsMeta = this.pluginsMetadata(['instance', 'events'], returnDisabled);

    const list = {};

    for (const [id, {instance, events}] of Object.entries(pluginsMeta)) {
      let _handler: EventHandler = null;

      for (const [name, handler] of Object.entries(events)) {
        if (name !== eventName) {
          continue;
        }
        _handler = ('string' === typeof handler ? [instance, name] : handler) as EventHandler;
      }

      if (_handler) {
        list[id] = _handler;
      }
    }

    return list;
  }

  /**
   * Returns the plugin instance with the specified ID.
   *
   * @param id - Plugin ID (e.g. `myPlugin`).
   * @param [throwException] - Whether to throw an exception if `id` is not registered with the locator before.
   * @return The plugin of the specified ID. If `throwException` is false and `id`
   * is not registered before, null will be returned.
   * @throws InvalidConfigError - If `id` refers to a nonexistent plugin ID
   * @see {@link has has()}
   * @see {@link set set()}
   */
  public get<T extends object = object>(id: string, throwException: boolean = true): T | null {
    if (this._plugins.has(id)) {
      return this._plugins.get(id) as T;
    }

    if (this._definitions.has(id)) {
      const definition = this._definitions.get(id);

      if (definition instanceof Component) {
        return this._plugins.set(id, definition as any).get(id) as T;
      }

      return this._plugins.set(id, this.createInstance(id, definition)).get(id) as T;
    } else if (throwException) {
      throw new InvalidCallError(`Unknown plugin ID: ${id}`);
    }

    return null;
  }

  /**
   * Returns status of plugin is disabled or not
   * @param id - Plugin ID (e.g. `myPlugin`).
   */
  public checkDisabled(id: string): boolean {
    if (!this.has(id)) {
      return false;
    }

    return this.getAttribute<boolean>(id, 'disabled');
  }

  /**
   * Registers a plugin definition with this container.
   *
   * If a plugin definition with the same ID already exists, it will be overwritten.
   *
   * @param id - Plugin ID (e.g. `myPlugin`).
   * @param definition - The plugin definition
   * @param [performValidation] - Perform validation against provided definition before registering.
   */
  public set(id: string, definition: PluginDefinition | null, performValidation: boolean = true): void {
    this._plugins.delete(id);

    if (definition === null) {
      this._definitions.delete(id);
      return;
    }

    if (isPlainObject(definition)) {
      if (performValidation) {
        const schema = readSchemaFile('@jiiRoot/schemas/plugin')?.additionalProperties ?? {};
        (new Configuration<PluginDefinition>(definition, schema)).validate({}, true);
      }
      this._definitions.set(id, definition);
      this._attributes.set(id, new Map);
      return;
    }

    throw new InvalidConfigError(`Unexpected configuration type for the '${id}' plugin: ${typeof definition}`);
  }

  /**
   * Registers a set of plugin definitions in this container.
   *
   * This is the bulk version of {@link set set()}. The parameter should be an array
   * whose keys are plugin IDs and values the corresponding plugin definitions.
   *
   * For more details on how to specify plugin IDs and definitions, please refer to {@link set set()}.
   *
   * If a plugin definition with the same ID already exists, it will be overwritten.
   *
   * The following is an example for registering two plugin definitions:
   *
   * @example
   * {
   *   pluginsId: {
   *     path: '@plugins/my-plugin',
   *     ...,
   *   },
   *   ...,
   * }
   *
   * @param plugins - Plugin definitions or instances
   * @param [performValidation] - Perform validation against each definition before registering.
   */
  public setPlugins(plugins: PluginsDefinition, performValidation: boolean = true): void {
    for (const [id, plugin] of Object.entries(plugins)) {
      this.set(id, plugin, performValidation);
    }
  }

  /**
   * Returns a value indicating whether the locator has the specified plugin definition or has instantiated the plugin.
   * This method may return different results depending on the value of `checkInstance`.
   *
   * - If `checkInstance` is false (default), the method will return a value indicating whether the locator has the specified
   *   plugin definition.
   * - If `checkInstance` is true, the method will return a value indicating whether the locator has
   *   instantiated the specified plugin.
   *
   * @param id plugin ID (e.g. `db`).
   * @param [checkInstance] whether the method should check if the plugin is shared and instantiated.
   * @return bool whether the locator has the specified plugin definition or has instantiated the plugin.
   * @see set()
   */
  public has(id: string, checkInstance: boolean = false): boolean {
    return checkInstance ? this._plugins.has(id) : this._definitions.has(id);
  }

  /**
   * Removes the plugin from registry.
   * @param id - The plugin ID
   */
  public clear(id: string): void {
    this._plugins.delete(id);
    this._definitions.delete(id);
    this._attributes.delete(id);
  }

  /**
   * Sets plugins attribute
   * @param id - Plugin ID
   * @param name - Attribute name
   * @param value - The value to store
   */
  public setAttribute(id: string, name: string | symbol, value: any): void {
    if (!this.has(id)) {
      throw new Error(`Unknown plugin ID: '${id}'`);
    }
    this._attributes.get(id).set(name, value);
  }

  /**
   * Checks plugins attribute
   * @param id - Plugin ID
   * @param name - Attribute name
   */
  public hasAttribute(id: string, name: string | symbol): boolean {
    if (!this.has(id) || !this._attributes.has(id)) {
      return false;
    }

    return this._attributes.get(id).has(name);
  }

  /**
   * Gets plugins attribute
   * @param id - Plugin ID
   * @param name - Attribute name
   * @return The value or `undefined` if the attribute does not exist.
   */
  public getAttribute<T = any>(id: string, name: string | symbol): T | undefined {
    if (!this.hasAttribute(id, name)) {
      return undefined;
    }
    return this._attributes.get(id).get(name);
  }

  /**
   * Gets plugins attributes
   * @param id - Plugin ID
   */
  public attributes<T extends PluginAttributes = PluginAttributes>(id: string): T {
    if (!this.has(id)) {
      return {} as any;
    }
    return <T>(Object.fromEntries(this._attributes.get(id).entries()));
  }

  /**
   * Create plugins attributes
   * @param id - Plugin ID
   */
  public clearAttributes(id: string): void {
    if (!this.has(id)) {
      return;
    }

    this._attributes.get(id).clear();
  }
}
