/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Instance from './Instance';
import Component from './Component';
import InvalidConfigError from './InvalidConfigError';

// utils
import Jii from '../Jii';
import {isPlainObject} from '~/helpers/object';

// types
import {ObjectType} from './Instance';
import {ComponentsDefinition} from '~/typings/components';

/**
 * To use ServiceLocator, you first need to register component IDs with the corresponding component
 * definitions with the locator by calling {@link set set()} or {@link setComponents setComponents()}.
 * You can then call {@link get get()} to retrieve a component with the specified ID. The locator will automatically
 * instantiate and configure the component according to the definition.
 */
export default class ServiceLocator extends Component {
  /**
   * Shared component instances indexed by their IDs
   */
  private _components: Map<string, any> = new Map;

  /**
   * Component definitions indexed by their IDs
   */
  private _definitions: Map<string, any> = new Map;

  /**
   * Returns a value indicating whether the locator has the specified component definition or has instantiated the component.
   * This method may return different results depending on the value of `checkInstance`.
   *
   * - If `checkInstance` is false (default), the method will return a value indicating whether the locator has the specified
   *   component definition.
   * - If `checkInstance` is true, the method will return a value indicating whether the locator has
   *   instantiated the specified component.
   *
   * @param id component ID (e.g. `db`).
   * @param [checkInstance] whether the method should check if the component is shared and instantiated.
   * @return bool whether the locator has the specified component definition or has instantiated the component.
   * @see set()
   */
  public has(id: string, checkInstance: boolean = false): boolean {
    return checkInstance ? this._components.has(id) : this._definitions.has(id);
  }

  /**
   * Returns the component instance with the specified ID.
   *
   * @param id - Component ID (e.g. `db`).
   * @param throwException - Whether to throw an exception if `id` is not registered with the locator before.
   * @return object|null the component of the specified ID. If `throwException` is false and `id`
   * is not registered before, null will be returned.
   * @throws InvalidConfigError - If `id` refers to a nonexistent component ID
   * @see {@link has has()}
   * @see {@link set set()}
   */
  public get<T = Component>(id, throwException: boolean = true): T | null {
    if (this._components.has(id)) {
      return this._components.get(id);
    }

    if (this._definitions.has(id)) {
      const definition = this._definitions.get(id);
      if ('object' === typeof definition && definition instanceof Component) {
        return this._components
          .set(id, definition)
          .get(id);
      }

      return this._components
        .set(id, Jii.createObject(definition))
        .get(id);
    } else if (throwException) {
      throw new InvalidConfigError(`Unknown component ID: ${id}`);
    }

    return null;
  }

  /**
   * Registers a component definition with this locator.
   *
   * @example
   * // a class name
   * classOf('@jiiRoot/caching/FileCache');
   *
   * // a configuration array
   * classOf({
   *   class: '@jiiRoot/db/Connection',
   *   dsn: 'mysql:host=127.0.0.1;dbname=demo',
   *   username: 'root',
   *   password: '',
   *   charset: 'utf8',
   * });
   *
   * // an anonymous function
   * classOf(params => {
   *     return new FileCache;
   * });
   *
   * // an instance
   * classOf(new FileCache);
   *
   * If a component definition with the same ID already exists, it will be overwritten.
   *
   * @param id - Component ID (e.g. `db`).
   * @param definition - The component definition to be registered with this locator.
   */
  public set(id: string, definition: ObjectType | null): void {
    this._components.delete(id);

    if (definition === null) {
      this._definitions.delete(id);
      return;
    }

    if (isPlainObject(definition)) {
      Instance.classOf(definition);
      this._definitions.set(id, definition);
      return;
    }

    throw new InvalidConfigError(`Unexpected configuration type for the '${id}' component: ${typeof definition}`);
  }

  /**
   * Removes the component from the locator.
   * @param id - The component ID
   */
  public clear(id: string): void {
    this._components.delete(id);
    this._definitions.delete(id);
  }

  /**
   * Returns the list of the component definitions or the loaded component instances.
   * @param returnDefinitions - Whether to return component definitions instead of the loaded component instances.
   * @return The list of the component definitions or the loaded component instances (ID: definition or instance).
   *
   * @example
   * {
   *   db: {
   *     class: '@jiiRoot/db/Connection',
   *     dsn: 'sqlite:path/to/file.db',
   *   },
   *   cache: {
   *     class: '@jiiRoot/caching/DbCache',
   *     db: 'db',
   *   },
   * }
   */
  public getComponents(returnDefinitions: boolean = true): { [p: string]: any } {
    return Object.fromEntries(
      returnDefinitions
        ? this._definitions.entries()
        : this._components.entries(),
    );
  }

  /**
   * Registers a set of component definitions in this locator.
   *
   * This is the bulk version of {@link set set()}. The parameter should be an array
   * whose keys are component IDs and values the corresponding component definitions.
   *
   * For more details on how to specify component IDs and definitions, please refer to {@link set set()}.
   *
   * If a component definition with the same ID already exists, it will be overwritten.
   *
   * The following is an example for registering two component definitions:
   *
   * @example
   * {
   *   db: {
   *     class: '@jiiRoot/db/Connection',
   *     dsn: 'sqlite:path/to/file.db',
   *   },
   *   cache: {
   *     class: '@jiiRoot/caching/DbCache',
   *     db: 'db',
   *   },
   * }
   *
   * @param components - Component definitions or instances
   */
  public setComponents(components: ComponentsDefinition): void {
    for (const [id, component] of Object.entries(components)) {
      this.set(id, component);
    }
  }
}
