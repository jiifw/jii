/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import {isObject} from '../helpers/object';
import {bindClass} from '../helpers/auto-bind';

const PROPERTY_SCOPES = <const>['read', 'write', 'read-write'];

export type PropertyMeta = { scope: PropertyScope, value: any }
export type PropertyName = string | symbol;
export type Props = { [name: string | symbol]: any }
export type PropertyScope = typeof PROPERTY_SCOPES[number];

/**
 * BaseObject is the base class that implements the *property* feature.
 */
export default class BaseObject {
  private _props: Map<PropertyName, PropertyMeta> = new Map();

  /**
   * Configures an object with the initial property values.
   */
  constructor(props: Props = {}) {
    if (props && !isObject(props)) {
      throw new Error('config must be an object');
    }

    for (const key in props) {
      this._props.set(key, {scope: 'read-write', value: props[key]});
    }

    bindClass(this);
    this.init();
  }

  /**
   * Initializes the object.
   * This method is invoked at the end of the constructor after the object is initialized with the
   * given configuration.
   */
  init(): void {
  }

  /**
   * Gets the value of the property.
   * @param name - The property name
   * @param throwException - If true, an exception will be thrown if the property is not found or invalid scope.
   * @returns The value of the property
   */
  getProperty<T>(name: PropertyName, throwException: boolean = true): T | undefined {
    if (!this.hasProperty(name)) {
      if (throwException) throw new Error(`Property '${name.toString()}' not found`);
      return undefined;
    }

    const {scope, value} = this._props.get(name);

    if (!['read', 'read-write'].includes(scope)) {
      throw new Error(`Cannot read property '${name.toString()}'`);
    }

    return value as T;
  }

  /**
   * Sets the value of the property.
   * @param name - The property name
   * @param value - The value
   * @param scope - The scope of the property
   */
  setProperty(name: PropertyName, value: any, scope: PropertyScope = 'read-write'): void {
    if (!PROPERTY_SCOPES.includes(scope)) {
      throw new Error(`Invalid scope: '${scope}', should be one of '${PROPERTY_SCOPES.join(', ')}'`);
    }

    if (!this.hasProperty(name)) {
      this._props.set(name, {scope, value});
      return;
    }

    if (!['write', 'read-write'].includes(<PropertyScope><unknown>this._props.get(name).scope)) {
      throw new Error(`Cannot set property '${name.toString()}' with scope '${scope}'`);
    }

    this._props.set(name, {scope, value});
  }

  /**
   * Checks if the object has the given property.
   * @param name - The property name
   * @returns True if the object has the given property
   */
  hasProperty(name: PropertyName): boolean {
    return this._props.has(name);
  }

  /**
   * Checks if the object can be accessed by the given key.
   * @param name - The property name
   * @returns True if the object can be accessed by the given key
   */
  canSetProperty(name: PropertyName): boolean {
    return this.hasProperty(name) && ['read-write', 'write'].includes(this._props.get(name).scope);
  }

  /**
   * Checks if the object can be accessed by the given key.
   * @param name - The property name
   * @returns True if the object can be accessed by the given key
   */
  canGetProperty(name: PropertyName): boolean {
    return this.hasProperty(name) && ['read-write', 'read'].includes(this._props.get(name).scope);
  }

  /**
   * Checks if the object has the given method.
   * @param name - The property name
   * @returns True if the object has the given method
   */
  hasMethod(name: PropertyName): boolean {
    return this.hasProperty(name)
      && 'function' === typeof this._props.get(name).value
      && ['AsyncFunction', 'Function'].includes((<Function>this._props.get(name).value).constructor.name);
  }
}
