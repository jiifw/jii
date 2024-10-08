/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import Jii from '~/Jii';
import {invokeModuleMethod} from '~/helpers/file';
import {checkEventHandler, invoke, invokeMethod} from '~/helpers/function';

// classes
import Event, {EventData, EventHandler, Events} from './Event';
import BaseObject, {PropertyName, PropertyScope, PropertyValue} from './BaseObject';

// error classes
import InvalidCallError from './InvalidCallError';
import UnknownMethodError from './UnknownMethodError';
import UnknownPropertyError from './UnknownPropertyError';

// types
import {ObjectType} from '../BaseJii';
import Behavior, {BehaviorArgs, Instance as BehaviorInstance} from './Behavior';
import InvalidArgumentError from './InvalidArgumentError';

// public types
export type Instance = InstanceType<typeof Component>;
export type {EventHandler, EventData, Events} from './Event';
export type {PropertyMeta, PropertyName, Props, PropertyScope, PropertyValue} from './BaseObject';

/**
 * Component is the base class that implements the *property*, *event* and *behavior* features.
 *
 * Component provides the *event* and *behavior* features, in addition to the *property* feature which is implemented in
 * its parent class {@link BaseObject}.
 *
 * Event is a way to "inject" custom code into existing code at certain places. For example, a comment object can trigger
 * an "add" event when the user adds a comment. We can write custom code and attach it to this event so that when the event
 * is triggered (i.e. comment will be added), our custom code will be executed.
 *
 * An event is identified by a name that should be unique within the class it is defined at. Event names are *case-sensitive*.
 *
 * One or multiple callbacks, called *event handlers*, can be attached to an event. You can call {@link trigger trigger()} to
 * raise an event. When an event is raised, the event handlers will be invoked automatically in the order they were
 * attached.
 *
 * To attach an event handler to an event, call {@link on on()}:
 *
 * ```ts
 * post.on('update', (event: Event) => {
 *     // send email notification
 * });
 * ```
 *
 * In the above, an anonymous function is attached to the "update" event of the post. You may attach
 * the following types of event handlers:
 *
 * 1. <code style="color:#B87333">async (event: Event, data: any): Promise<void> => { ... }</code> // Anonymous async function
 * 2. <code style="color:#B87333">(event: Event, data: any): void => { ... }</code> // Anonymous sync function
 * 3. <code style="color:#B87333">[instance, 'handleAdd']</code> // object method
 * 4. <code style="color:#B87333">[Page, 'handleAdd']</code> // static class method
 * 4. <code style="color:#B87333">['@app/classes/Page', 'handleAdd']</code> // alias based class path
 * 6. <code style="color:#B87333">'handleAdd'</code> // global function
 *
 * The event handler must be defined with the following signature,
 *
 * ```
 * async (event: Event)
 * ```
 *
 * where `event` is an {@link Event} object which includes parameters associated with the event.
 *
 * Sometimes, you may want to associate extra data with an event handler when you attach it to an event
 * and then access it when the handler is invoked. You may do so by
 *
 * ```js
 * post.on('update', (event: Event) => {
 *     // the data can be accessed via 'event.data'
 * }, data);
 * ```
 * @see https://github.com/yiisoft/yii2/blob/master/framework/base/Component.php
 */
export default class Component extends BaseObject {
  /**
   * The attached event handlers (event name: handlers)
   */
  private _events: Events = new Map;

  /**
   * The attached behaviors (behavior name: behavior). This is `null` when not initialized.
   */
  private _behaviors: Map<string, BehaviorInstance> = new Map;

  /**
   * Returns the value of a component property.
   *
   * This method will check in the following order and act accordingly:
   *
   *  - a property defined by a getter: return the getter result
   *  - a property of a behavior: return the behavior property value
   *
   * @param name - The property name
   * @param throwException - If true, an exception will be thrown if the property is not found or invalid scope.
   * @returns The value of the property
   */
  getProperty<T>(name: PropertyName, throwException: boolean = true): T | undefined {
    if (super.hasProperty(name)) {
      return super.getProperty<T>(name, throwException);
    }

    this.ensureBehaviors();
    for (const behavior of Object.values(this._behaviors) as BehaviorInstance[]) {
      if (behavior.hasProperty(name)) {
        return behavior.getProperty<T>(name);
      }
    }

    throw new UnknownPropertyError(`Getting unknown property: ${this.constructor.name}.${name.toString()}`);
  }

  /**
   * Sets the value of the property.
   * @param name - The property name
   * @param value - The value
   *
   * This method will check in the following order and act accordingly:
   *
   *  - a property defined by a setter: set the property value<br>
   *  - an event in the format of "on xyz": attach the handler to the event "xyz"<br>
   *  - a behavior in the format of "as xyz": attach the behavior named as "xyz"<br>
   *  - a property of a behavior: set the behavior property value
   *
   * Passing values will change from property to a method, for instance:
   *
   * - `baseObj.setProperty('checkAccess', async (user) => { ... });` // Consider as a method, use {@link invoke invoke()} to call)
   * - `baseObj.setProperty('userType', 'admin');` // *no-function*, Consider as a property:, use {@link getProperty getProperty()} to retrieve)
   *
   * @param [scope] - The scope of the property
   */
  public setProperty<T = PropertyValue>(name: PropertyName, value: T, scope: PropertyScope = 'read-write'): void {
    if (super.canSetProperty(name)) {
      super.setProperty(name, value, scope);
      return;
    }

    if (typeof name === 'string') {
      if (name.startsWith('on ')) {
        this.on(name.replace(/^on /, ''), value as EventHandler);
        return;
      } else if (name.startsWith('as ')) {
        const behavior: BehaviorInstance = value instanceof Behavior ? value : Jii.createObject(<ObjectType>value);
        this.attachBehavior(name.replace(/^as /, ''), behavior);
        return;
      }
    }

    this.ensureBehaviors();
    for (const behavior of Object.values(this._behaviors) as BehaviorInstance[]) {
      if (behavior.canSetProperty(name)) {
        behavior.setProperty(name, value);
        return;
      }
    }

    throw new UnknownPropertyError(`Setting unknown property: ${this.constructor.name}.${name.toString()}`);
  }

  /**
   * Checks if the object has the given property.
   * @param name - The property name
   * @param checkBehaviors - Whether to treat behaviors' properties as properties of this component
   * @returns True if the object has the given property
   */
  hasProperty(name: PropertyName, checkBehaviors: boolean = true): boolean {
    if (super.hasProperty(name)) {
      return true;
    } else if (checkBehaviors) {
      this.ensureBehaviors();
      for (const behavior of Object.values(this._behaviors) as BehaviorInstance[]) {
        if (behavior.hasProperty(name)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Checks that property is writeable / settable or not
   * @param name - The property name
   * @param checkBehaviors - Whether to treat behaviors' properties as properties of this component
   * @returns True if the property is settable.
   */
  canSetProperty(name: PropertyName, checkBehaviors: boolean = true): boolean {
    if (super.canSetProperty(name)) {
      return true;
    } else if (checkBehaviors) {
      this.ensureBehaviors();
      for (const behavior of Object.values(this._behaviors) as BehaviorInstance[]) {
        if (behavior.canSetProperty(name)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Checks that property is assessable or readable
   * @param name - The property name
   * @param checkBehaviors - Whether to treat behaviors' properties as properties of this component
   * @returns True if property is readable and false otherwise
   */
  canGetProperty(name: PropertyName, checkBehaviors: boolean = true): boolean {
    if (super.canGetProperty(name)) {
      return true;
    } else if (checkBehaviors) {
      this.ensureBehaviors();
      for (const behavior of Object.values(this._behaviors) as BehaviorInstance[]) {
        if (behavior.canGetProperty(name)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Checks if the object has the given method.
   * @param name - The property name
   * @param checkBehaviors - Whether to treat behaviors' properties as properties of this component
   * @returns True if method exists, false otherwise
   */
  hasMethod(name: PropertyName, checkBehaviors: boolean = true): boolean {
    if (super.hasMethod(name)) {
      return true;
    } else if (checkBehaviors) {
      this.ensureBehaviors();
      for (const behavior of Object.values(this._behaviors) as BehaviorInstance[]) {
        if (behavior.hasMethod(name)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Invokes a component or a behaviour method.
   * @param name - Function name
   * @param args - Arguments passed to the function
   * @returns The result of the function
   * @see {@link hasMethod hasMethod()}
   * @see {@link ensureBehaviors ensureBehaviors()}
   *
   * @example
   * component.setProperty('checkAccess', async (user) => {
   *   return user === 'admin';
   * });
   * // expected: 'Has access?' true
   * console.log('Has access?', await component.invoke<boolean>('checkAccess', 'admin'));
   */
  public async invoke<T>(name: string, ...args: any[]): Promise<T> {
    if (super.hasMethod(name)) {
      return super.invoke<T>(name, ...args);
    }

    this.ensureBehaviors();

    for (const behavior of this._behaviors.values()) {
      if (behavior.hasMethod(name)) {
        return behavior.invoke<T>(name, ...args);
      }
    }

    throw new UnknownMethodError(`Trying to call an unknown method: ${this.constructor.name}.${name}()`);
  }

  /**
   * Returns a value indicating whether there is any handler attached to the named event.
   * @param name - The event name
   * @returns Whether there is any handler attached to the event.
   */
  public hasEventHandlers(name: string): boolean {
    if (this._events.has(name)) {
      return true;
    }

    return Event.hasHandlers(name);
  };

  /**
   * Attaches an event handler to an event.
   *
   * The event handler must be a valid callback. The following are
   * some examples:
   *
   * 1. <code style="color:#B87333">async (event: Event): Promise<void> => { ... }</code> // Anonymous async function
   * 2. <code style="color:#B87333">(event: Event): void => { ... }</code> // Anonymous sync function
   * 3. <code style="color:#B87333">[instance, 'handleAdd']</code> // object method
   * 4. <code style="color:#B87333">[Page, 'handleAdd']</code> // static class method
   * 4. <code style="color:#B87333">['@app/classes/Page', 'handleAdd']</code> // alias based class path
   * 6. <code style="color:#B87333">'handleAdd'</code> // global function
   *
   * The event handler must be defined with the following signature,
   *
   * ```
   * (event: Event)
   * ```
   *
   * Where `event` is an {@link Event Event} object which includes parameters associated with the event.
   *
   * @param name - The event name
   * @param handler - The event handler
   * @param data - The data to be passed to the event handler when the event is triggered.
   * When the event handler is invoked, this data can be accessed via {@link Event#data Event.data}.
   * @see {@link off off()}
   * @throws Error if the handler is not a valid callback
   */
  public on(name: string, handler: EventHandler, data: EventData = null): void {
    // validates handler argument
    checkEventHandler(handler);

    if (!this._events.has(name)) {
      this._events.set(name, new Map());
    }

    this._events.get(name).set(handler, data);
  }

  /**
   * Detaches an existing event handler from this component.
   *
   * This method is the opposite of {@link on on()}.
   *
   * Note: in case wildcard pattern is passed for event name, only the handlers registered with this
   * wildcard will be removed, while handlers registered with plain names matching this wildcard will remain.
   *
   * @param name - Event name
   * @param handler - The event handler to be removed.<br>
   * If it is null, all handlers attached to the named event will be removed.<br>
   * @returns If a handler is found and detached
   * @see {@link on on()}
   */
  public off(name: string, handler: EventHandler | null): boolean {
    if (!this._events.has(name)) {
      return false;
    }

    if (!handler) {
      this._events.delete(name);
      return true;
    }

    // plain event names
    if (this._events?.get(name)?.has(handler)) {
      this._events.get(name).delete(handler);

      if (!this._events.get(name).size) {
        this._events.delete(name);
      }

      return true;
    }

    return false;
  }

  /**
   * Triggers an event.
   *
   * This method represents the happening of an event. It invokes all attached handlers for the event
   * including class-level handlers.
   *
   * @param name - The event name
   * @param event - The event instance. If not set, a default {@link Event} object will be created.
   */
  public async trigger(name: string, event: Event | null = null): Promise<void> {
    if (!this._events.has(name) || !this._events.get(name).size) {
      return;
    }

    if (!event || !(event instanceof Event)) {
      event = new Event();
    }

    if (!event.sender) {
      event.sender = this;
    }

    event.handled = false;
    event.name = name;

    for await (const [handler, data] of this._events.get(name).entries()) {
      event.data = data;

      if (typeof handler === 'string') {
        // global function
        await invoke(handler, [event]);
      }

      if (typeof handler === 'function') {
        // anonymous function
        await invoke(handler, [event]);
      }

      if (Array.isArray(handler)) {
        const [target, funcName] = handler;

        if ('string' === typeof target && target.startsWith('@')) {
          // module method
          await invokeModuleMethod(target, funcName, [event]);
        } else if (['object', 'function'].includes(typeof target)) {
          // object method or a static class method
          await invokeMethod(<object | Function>target, funcName, [event]);
        } else {
          throw new InvalidCallError('Handler must be be a valid function or a method');
        }
      }

      // stop further handling if the event is handled
      if (event.handled) {
        return;
      }
    }

    // invoke class-level attached handlers
    await Event.trigger(name, event);
  }

  /**
   * Returns a list of behaviors that this component should behave as.
   *
   * Child classes may override this method to specify the behaviors they want to behave as.
   *
   * The return value of this method should be an array of behavior objects or configurations
   * indexed by behavior names. A behavior configuration can be either a string specifying
   * the behavior class or an object of the following structure:
   *
   * ```js
   * behaviorName: {
   *     class: '@path/to/BehaviorClass',
   *     property1: 'value1',
   *     property2; 'value2',
   * }
   * ```
   *
   * Note that a behavior class must extend from {@link Behavior}. Behaviors can be attached using a name or anonymously.
   * When a name is used as the array key, using this name, the behavior can later be retrieved using {@link getBehavior getBehavior()}
   * or be detached using {@link detachBehavior detachBehavior()}. Anonymous behaviors can not be retrieved or detached.
   *
   * Behaviors declared in this method will be attached to the component automatically (on demand).
   *
   * @returns The behavior configurations.
   */
  public behaviors(): Record<string, BehaviorInstance> {
    return {};
  }

  /**
   * Returns the named behavior object.
   * @param name the behavior name
   * @returns The behavior object, or null if the behavior does not exist
   */
  public getBehavior(name: string): BehaviorInstance | null {
    this.ensureBehaviors();
    return this._behaviors.has(name)
      ? this._behaviors.get(name)
      : null;
  }

  /**
   * Returns all behaviors attached to this component.
   * @returns List of behaviors attached to this component
   */
  public getBehaviors(): BehaviorInstance[] {
    this.ensureBehaviors();
    return Array.from(this._behaviors.values());
  }

  /**
   * Attaches a behavior to this component.
   * This method will create the behavior object based on the given
   * configuration. After that, the behavior object will be attached to
   * this component by calling the {@link Behavior#attach Behavior.attach()} method.
   * @param name the name of the behavior.
   * @param behavior the behavior configuration. This can be one of the following:
   *
   *  - a {@link Behavior} object
   *  - a string specifying the behavior class
   *  - an object configuration array that will be passed to {@link BaseJii#createObject Jii.createObject()} to create the behavior object.
   *
   * @return Behavior the behavior object
   * @see {@link detachBehavior detachBehavior()}
   */
  public attachBehavior(name: string, behavior: BehaviorArgs): BehaviorInstance {
    this.ensureBehaviors();
    return this.attachBehaviorInternal(name, behavior);
  }

  /**
   * Attaches a list of behaviors to the component.
   *
   * Each behavior is indexed by its name and should be a {@link Behavior} object,
   * a string specifying the behavior class, or a configuration array for creating the behavior.
   * @param behaviors list of behaviors to be attached to the component
   * @see {@link attachBehavior attachBehavior()}
   * @see attachBehavior()
   */
  public attachBehaviors(behaviors: Record<string, BehaviorArgs>): void {
    this.ensureBehaviors();
    for (const [name, behavior] of Object.entries(behaviors)) {
      this.attachBehaviorInternal(name, behavior);
    }
  }

  /**
   * Detaches a behavior from the component.<br>
   * The behavior's {@link Behavior#detach Behavior.detach()} method will be invoked.
   * @param name the behavior's name.
   * @returns The detached behavior. Null if the behavior does not exist.
   */
  public detachBehavior(name: string): BehaviorInstance | null {
    this.ensureBehaviors();

    if (this._behaviors.has(name)) {
      const behavior = this._behaviors.get(name);
      this._behaviors.delete(name);
      behavior.detach();
      return behavior;
    }

    return null;
  }

  /**
   * Detaches all behaviors from the component.
   */
  public detachBehaviors(): void {
    this.ensureBehaviors();
    for (const name of this._behaviors.keys()) {
      this.detachBehavior(name);
    }
  }

  /**
   * Makes sure that the behaviors declared in {@link behaviors behaviors()} are attached to this component.
   */
  public ensureBehaviors(): void {
    if (!this._behaviors) {
      this._behaviors.clear();

      for (const [name, behavior] of Object.entries(this.behaviors())) {
        this.attachBehaviorInternal(name, behavior);
      }
    }
  }

  /**
   * Attaches a behavior to this component
   * @param name - The name of the behavior
   * @param behavior - The behavior to be attached
   * @returns The attached behavior
   */
  public attachBehaviorInternal(name: string, behavior: BehaviorArgs): BehaviorInstance {
    if (!(behavior instanceof Behavior) || 'string' === typeof behavior) {
      behavior = Jii.createObject<BehaviorInstance>(behavior);
    }

    if (!(behavior instanceof Behavior)) {
      throw new InvalidArgumentError(`The behavior must be a string specifying the behavior class or an instance of Behavior`);
    }

    if (this._behaviors.has(name)) {
      this._behaviors.get(name).detach();
    }

    behavior.attach(this);
    this._behaviors.set(name, behavior);

    return behavior;
  }
}
