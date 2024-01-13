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
import {resolve} from '../helpers/path';
import {isObject, isPlainObject} from '../helpers/object';
import {isClass, hasOwnMethod, isConstructor} from '../helpers/reflection';

// types
import {EventHandler} from './Event';
import {Constructor} from '../typings/utility';

export type ObjectType = (
  | string // alias path to class (e.g., '@app/components/User')
  | Function // as a class object
  | { class: string | object; [prop: string]: any; } // as an object configuration
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
   * @param type - The configuration object
   * @returns The constructor class
   */
  public static classOf<T = Function>(type: ObjectType): T | null {
    if (typeof type === 'string' && type.startsWith('@')) { // <-- from a string
      return require(resolve(type))?.default ?? null;
    }

    if ('function' === typeof type) { // <-- from a function
      if (!isClass(type)) {
        throw new Error('Type must be a class');
      }
      return type as T;
    }

    if (isObject(type)) { // <-- from an object
      const conf: { class?: string; [prop: string]: any; } = {...type as Object};

      if (!Object.hasOwn(conf, 'class')) {
        throw new InvalidConfigError(`Object configuration should have a 'class' property`);
      }

      if (isConstructor(conf.class)) {
        return conf.class as T;
      }

      if (isClass(conf.class)) {
        return <T><unknown>(type as any)?.class;
      }

      if ('string' !== typeof conf.class) {
        throw new InvalidConfigError(`Object configuration 'class' should be a string property`);
      }

      if (!conf.class.startsWith('@')) {
        throw new InvalidConfigError(`Object configuration 'class' should start with a @alias.`);
      }

      return require(resolve(conf.class))?.default ?? null;
    }

    throw new InvalidConfigError('File must have an actual class and should be exported as default');
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
    let props: Record<string, any> = {};

    const Class = Instance.classOf<Constructor>(type) as T;
    const instance = new (Class as Constructor)(...params);

    if (!Instance.isComponent(instance)) {
      if (Object.keys(props).length) {
        for (const [prop, value] of Object.entries(props)) {
          if (instance[prop] === undefined) {
            throw new Error(`Class has no such property: '${prop}'`);
          }

          instance[prop] = value;
        }
      }

      if (hasOwnMethod(instance, 'init')) {
        instance.init.call(instance);
      }

      return instance;
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

    return instance;
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
