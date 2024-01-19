/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Component from './Component';
import {BehaviorArgs} from './Behavior';
import InvalidConfigError from './InvalidConfigError';

// utils
import {isPath, resolve} from '../helpers/path';
import {isObject, isPlainObject} from '../helpers/object';
import {isClass, hasOwnMethod, isConstructor} from '../helpers/reflection';

// types
import {EventHandler} from './Event';
import {Constructor} from '../typings/utility';
import {ComponentDefinition, ModuleDefinition} from '../typings/components';
import BaseObject from './BaseObject';

export type ObjectType = (
  | string // alias path to class (e.g., '@app/components/User')
  | Function // as a class object
  | ((() => Function) | ((...args) => Function)) // as an anonymous function
  | { class: string | object; [prop: string]: any; } // as an object configuration
  | ModuleDefinition
  | ComponentDefinition
  );

interface InstanceMetadata {
  class: Function;
  events?: Record<string, EventHandler>;
  behaviors?: Record<string, BehaviorArgs>;
  props?: Record<string, any>;
}

/**
 * Instance represents a reference to a named object in a dependency injection
 */

export default class Instance {
  /**
   * Get class object from component configuration
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
   * @param type - The configuration object
   * @returns The constructor class
   */
  public static classOf<T = Function>(type: ObjectType): T | null {
    if (typeof type === 'string') { // <-- from a string
      return this.classFromPath(type as string);
    }

    if (isClass(type)) { // <-- an instance
      return type as T;
    }

    if ('function' === typeof type) { // <-- an anonymous function
      const _constructor = type();
      if (_constructor instanceof Component || isConstructor(_constructor) || isClass(_constructor)) {
        return _constructor as T;
      }
    }

    if (isObject(type)) { // <-- from an definition
      return Instance.classFromDefinition<T>(type as ComponentDefinition);
    }

    throw new InvalidConfigError(`'type' must be an actual class, component definition, alias path or constructor function`);
  }

  /**
   * Retrieve the events or behaviors from a component configuration
   * @param type - The configuration object
   * @param lookFor - The type of events or behaviors to retrieve
   * @returns The events or behaviors list {name: handler|behavior,...}
   * @private
   */
  private static _of<T = Record<string, any>>(type: ObjectType, lookFor: 'event' | 'behavior'): T {
    if (!isPlainObject(type)) {
      return {} as T;
    }

    const prefix = lookFor === 'event' ? 'on ' : 'as ';

    const list = Object.keys(type).filter(prop => {
      return 'string' === typeof prop && prop.startsWith(prefix);
    });

    if (!list.length) {
      return {} as T;
    }

    return list.reduce((acc, prop) => {
      const _name = prop.replace(prefix, '');
      acc[_name] = type[prop];
      return acc;
    }, {}) as T;
  }

  public static classFromDefinition<T>(definition: ComponentDefinition): T {
    if (!isPlainObject(definition)) {
      throw new InvalidConfigError('Component configuration must be an object');
    }

    const conf: { class?: string; [prop: string]: any; } = {...definition as Object};

    if (!Object.hasOwn(conf, 'class')) {
      throw new InvalidConfigError(`Object configuration should have a 'class' property`);
    }

    if (isConstructor(conf.class) || isClass(conf.class)) {
      return conf.class as T;
    }

    return this.classFromPath<T>(conf.class as string);
  }

  public static classFromPath<T>(pathOrAlias: string): T {
    if (!pathOrAlias || 'string' !== typeof pathOrAlias || !pathOrAlias.trim()) {
      throw new InvalidConfigError(`Object configuration 'class' should be a string property`);
    }

    let Class;

    if (isPath(pathOrAlias, 'file')) {
      Class = require(pathOrAlias);
    } else {
      if (!pathOrAlias.startsWith('@')) {
        throw new InvalidConfigError(`Object configuration 'class' should start with a @alias.`);
      }

      try {
        Class = require(resolve(pathOrAlias));
      } catch (e) {
        throw new InvalidConfigError(`Object configuration class '${pathOrAlias}' should exist`);
      }
    }

    if (!Class?.default && !isConstructor(Class.default) && !isClass(Class.default)) {

      throw new InvalidConfigError('File must have an actual class and should be exported as default');
    }

    return Class.default;
  }

  /**
   * Get events from a component configuration
   * @param type - The configuration object
   * @returns The events list {name: handler, ...}
   */
  public static eventsOf<T = InstanceMetadata['events']>(type: ObjectType): T {
    return Instance._of<T>(type, 'event');
  }

  /**
   * Get events from a component behaviors
   * @param type - The configuration object
   * @returns The behaviors list {name: behavior, ...}
   */
  public static behaviorsOf<T = InstanceMetadata['behaviors']>(type: ObjectType): T {
    return Instance._of<T>(type, 'behavior');
  }

  /**
   * Get props from a component configuration
   * @param type - The configuration object
   * @returns The properties {name: value, ...}
   */
  public static propsOf<T = InstanceMetadata['props']>(type: ObjectType): T {
    if (!isPlainObject(type)) {
      return {} as T;
    }
    return Object.keys(type).filter(prop => {
      return prop !== 'class' && !prop.startsWith('as ') && !prop.startsWith('on ');
    }).reduce((acc, prop) => {
      acc[prop] = type[prop];
      return acc;
    }, {}) as T;
  }

  /**
   * Create an instance from a component configuration
   * @param type - The configuration object
   * @param params - The parameters to pass to the constructor
   * @returns The instance
   */
  public static createFrom<T = Constructor>(type: ObjectType, params: any[] = []): T {
    const props: Record<string, any> = {};

    const Class = Instance.classOf<Constructor>(type) as T;
    const instance = Class instanceof BaseObject ? Class : new (Class as Constructor)(...params);

    if (!(instance instanceof BaseObject)) {
      throw new InvalidConfigError(`Class '${Class.constructor.name}' must be an instance of component`);
    }

    if (!Instance.isComponent(instance)) {
      if (Object.keys(props).length) {
        for (const [prop, value] of Object.entries(props)) {
          if (instance[prop] === undefined) {
            throw new InvalidConfigError(`Class has no such property: '${prop}'`);
          }

          instance[prop] = value;
        }
      }

      if (hasOwnMethod(instance, 'init')) {
        instance.init.call(instance);
      }

      return instance as T;
    }

    Object.entries(Instance.propsOf(type)).forEach(([name, value]) => {
      (instance as Component).setProperty(name, value);
    });

    Object.entries(Instance.behaviorsOf(type)).forEach(([name, behavior]) => {
      (instance as Component).attachBehavior(name, behavior);
    });

    Object.entries(Instance.eventsOf(type)).forEach(([name, event]) => {
      (instance as Component).on(name, event);
    });

    instance.init.call(instance);

    return instance as T;
  }

  /**
   * Checks that the component is a valid component
   * @param comp - The class object
   * @returns True if the component is a valid component
   */
  public static isComponent(comp: any): boolean {
    return comp instanceof Component;
  }
}
