/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import {isPlainObject} from '../helpers/object';
import {invoke, isFunction} from '../helpers/function';
import {hasOwn} from '../helpers/reflection';
import {bindClass} from '../helpers/auto-bind';
import UnknownMethodError from './UnknownMethodError';
import InvalidScopeError from './InvalidScopeError';
import InvalidCallError from './InvalidCallError';
import UnknownPropertyError from './UnknownPropertyError';
import InvalidArgumentError from './InvalidArgumentError';

const PROPERTY_SCOPES = <const>['read', 'write', 'read-write'];

export type PropertyMeta = { scope: PropertyScope, value: any }
export type PropertyName = string | symbol;
export type Props = { [name: string | symbol]: any }
export type PropertyScope = typeof PROPERTY_SCOPES[number];
export type PropertyValue = (() => any) | (() => Promise<any>) | string | null | object | Array<any> | boolean;

/**
 * BaseObject is the base class that implements the *property* feature.
 */
export default class BaseObject extends Object {
  /**
   * Stores the object specific property meta.
   * @private
   */
  private _props: Map<PropertyName, PropertyMeta> = new Map();

  /**
   * Configures an object with the initial property values.
   */
  constructor(props: Props = {}) {
    super();

    if (!isPlainObject(props)) {
      throw new InvalidArgumentError('Properties must be a plain object');
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
  public init(): void {
  }

  /**
   * Gets the value of the property.
   * @param name - The property name
   * @param throwException - If true, an exception will be thrown if the property is not found or invalid scope.
   * @returns The value of the property
   */
  public getProperty<T = PropertyValue>(name: PropertyName, throwException: boolean = true): T | undefined {
    if (!this.hasProperty(name)) {
      if (throwException) throw new UnknownPropertyError(`Trying to get unknown property: '${this.constructor.name}.${name.toString()}'`);
      return undefined;
    }

    if ( hasOwn(this, name, 'property') ) {
      return this[name] as T;
    }

    const {scope, value} = this._props.get(name);

    if (!['read', 'read-write'].includes(scope)) {
      throw new InvalidCallError(`Trying to read write-only property: '${this.constructor.name}.${name.toString()}'`);
    }

    return value as T;
  }

  /**
   * Gets the value of the property *(with any scope)*
   *
   * **Note**: Properties with the 'write' are inaccessible from outside, however this method can read values (internally),<br>
   * although it does not read object's private or protected properties.
   *
   * @param name - The property name
   * @param throwException - If true, an exception will be thrown if the property is not found or invalid scope.
   * @returns The value of the write property
   */
  protected getPropertyInternal<T = any>(name: PropertyName, throwException: boolean = true): T {
    if (!this.hasProperty(name, false)) {
      if (throwException) throw new UnknownPropertyError(`Trying to get unknown property: '${this.constructor.name}.${name.toString()}'`);
      return undefined;
    }

    return this._props.get(name).value as T;
  }

  /**
   * Sets the value of the property.
   * @param name - The property name
   * @param value - The value
   * Passing values will change from property to a method, for instance:
   *
   * - `baseObj.setProperty('checkAccess', async (user) => { ... });` // Consider as a method, use {@link invoke invoke()} to call)
   * - `baseObj.setProperty('userType', 'admin');` // *no-function*, Consider as a property:, use {@link getProperty getProperty()} to retrieve)
   *
   * @param [scope] - The scope of the property
   */
  public setProperty<T = PropertyValue>(name: PropertyName, value: T, scope: PropertyScope = 'read-write'): void {
    if (!PROPERTY_SCOPES.includes(scope)) {
      throw new InvalidScopeError(`Trying to set property with invalid scope: '${scope}'`);
    }

    if (hasOwn(this, name, 'property')
      && Object.getOwnPropertyDescriptor(this, name).writable) {
      this[name] = value;
      return;
    }

    const hasProp: boolean = this.hasProperty(name, false);

    if (!hasProp) {
      this._props.set(name, {scope, value});
      return;
    }

    if (hasProp && ['write', 'read-write'].includes(<PropertyScope><unknown>this._props.get(name).scope)) {
      this._props.set(name, {scope, value});
      return;
    }

    throw new InvalidCallError(`Trying to set read-only property: '${this.constructor.name}.${name.toString()}'`);
  }

  /**
   * Checks if the object has the given property.
   * @param name - The property name
   * @param [checkVars] - Checks for the object properties
   * @returns True if the object has the given property
   */
  public hasProperty(name: PropertyName, checkVars: boolean = true): boolean {
    return (checkVars && hasOwn(this, name, 'property')) || this._props.has(name);
  }

  /**
   * Checks that property is writeable / settable or not
   * @param name - The property name
   * @param [checkVars] - Checks for the internal methods
   * @returns True if the property is settable.
   */
  public canSetProperty(name: PropertyName, checkVars: boolean = true): boolean {
    if (!this.hasProperty(name, checkVars)) {
      return true;
    }

    return checkVars && hasOwn(this, name, 'property')
      ? Object.getOwnPropertyDescriptor(this, name).writable
      : ['read-write', 'write'].includes(this._props.get(name).scope);
  }

  /**
   * Checks that property is assessable or readable
   * @param name - The property name
   * @param [checkVars] - Checks for the internal methods
   * @returns True if property is readable and false otherwise
   */
  public canGetProperty(name: PropertyName, checkVars: boolean = true): boolean {
    if (!this.hasProperty(name, checkVars)) {
      return false;
    }

    return checkVars && hasOwn(this, name, 'property')
      ? Object.getOwnPropertyDescriptor(this, name).enumerable
      : ['read-write', 'read'].includes(this._props.get(name).scope);
  }

  /**
   * Checks if the object has the given method.
   * @param name - The property name
   * @param [checkVars] - Checks for the internal methods
   * @returns True if the object has the given method
   */
  public hasMethod(name: PropertyName, checkVars: boolean = true): boolean {
    if (checkVars && hasOwn(this, name, 'method')) {
      return true;
    } else {
      return this._props.has(name) && isFunction(this._props.get(name).value);
    }
  }

  /**
   * Invokes a component method.
   * @param name - Function name
   * @param args - Arguments passed to the function
   * @returns The result of the function
   * @see {@link hasMethod hasMethod()}
   *
   * @example
   * baseObj.setProperty('checkAccess', async (user) => {
   *   return user === 'admin';
   * });
   * // expected: 'Has access?' true
   * console.log('Has access?', await baseObj.invoke<boolean>('checkAccess', 'admin'));
   */
  public async invoke<T>(name: string, ...args: any[]): Promise<T> {
    if (!this.hasMethod(name)) {
      throw new UnknownMethodError(`Trying to call an unknown method: '${this.constructor.name}.${name}()'`);
    }

    const func = hasOwn(this, name, 'method')
      ? this[name]
      : this._props.get(name).value;

    return invoke(func as Function, args, this);
  }
}
