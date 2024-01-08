/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import BaseObject from './BaseObject';

// utils
import {invoke, invokeMethod} from '../helpers/function';
import {invokeModuleMethod} from '../helpers/file';

// public types
export type EventHandler = (
  | ((event: Event, data?: any) => void) | ((event: Event, data?: any) => Promise<any>)
  | [object, string]
  | [string, string]
  | string
  );
export type EventData = Record<string, any> | null;
export type EventMap = Map<EventHandler, EventData>;
export type Events = Map<string, EventMap>;

/**
 * Event is the base class for all event classes.
 *
 * It encapsulates the parameters associated with an event.
 * The {@link sender} property describes who raises the event.
 * And the {@link handled} property indicates if the event is handled.
 * If an event handler sets {@link handled} to be `true`, the rest of the
 * uninvoked handlers will no longer be called to handle the event.
 *
 * Additionally, when attaching an event handler, extra data may be passed
 * and be available via the {@link data} property when the event handler is invoked.
 *
 * @see https://github.com/yiisoft/yii2/blob/master/framework/base/Event.php
 */
export default class Event extends BaseObject {
  /**
   * The event name. This property is set by {@link Component#trigger Component.trigger()} and {@link trigger trigger()}.
   * Event handlers may use this property to check what event it is handling.
   */
  public name;

  /**
   * The sender of this event. If not set, this property will be
   * set as the object whose {@link trigger trigger()} method is called.
   * This property may also be a `null` when this event is a
   * class-level event which is triggered in a static context.
   */
  public sender: object | null;

  /**
   * Whether the event is handled. Defaults to `false`.
   * When a handler sets this to be `true`, the event processing will stop and
   * ignore the rest of the uninvoked event handlers.
   */
  public handled: boolean = false;

  /**
   * The data that is passed to {@link Component#on Component.on()} when attaching an event handler.
   * Note that this varies according to which event handler is currently executing.
   */
  public data: EventData;

  /**
   * Contains all globally registered event handlers.
   */
  private static _events: Events = new Map;

  /**
   * Attaches an event handler to a class-level event.
   *
   * When a class-level event is triggered, event handlers attached
   * to that class and all parent classes will be invoked.
   *
   * For example, the following code attaches an event handler to `MyClass`'s
   * `afterInsert` event:
   *
   * ```ts
   * Event.on(MyClass.EVENT_AFTER_INSERT, async (event: Event) => {
   *     console.log(event.sender, 'is inserted.');
   * });
   * ```
   *
   * The handler will be invoked for EVERY successful MyClass data insertion.
   *
   * For more details about how to declare an event handler, please refer to {@link Component#on Component.on()}.
   *
   * @param name - The event name.
   * @param handler - The event handler.
   * @param data - The data to be passed to the event handler when the event is triggered.<br>
   * When the event handler is invoked, this data can be accessed via {@link data}.
   * @see {@link off off()}
   */
  on(name: string, handler: EventHandler, data: EventData = null): void {
    if ( !['string', 'function'].includes(typeof handler) && (
      !Array.isArray(handler) && handler.length !== 2 && ['function', 'object'].includes(typeof handler[0])
    )) {
      throw new Error('Invalid handler passed, it should be an array [object|class, data] or a function of function name');
    }

    if (!Event._events.has(name)) {
      Event._events.set(name, new Map());
    }

    Event._events.get(name).set(handler, data);
  }

  /**
   * Detaches an event handler from a class-level event.
   *
   * This method is the opposite of {@link on on()}.
   *
   * @param name - The event name.
   * @param handler - The event handler to be removed.<br>
   * If it is `null`, all handlers attached to the named event will be removed.
   * @returns Whether a handler is found and detached.
   * @see {@link on on()}
   */
  public static off(name: string, handler: EventHandler | null): boolean {
    if (!Event._events.has(name)) {
      return false;
    }

    if (!handler) {
      Event._events.delete(name);
      return true;
    }

    // plain event names
    if (Event._events?.get(name)?.has(handler)) {
      Event._events.get(name).delete(handler);
      return true;
    }

    return false;
  }

  /**
   * Detaches all registered class-level event handlers.
   * @see {@link on on()}
   * @see {@link off off()}
   */
  public static offAll(): void {
    Event._events = new Map;
  }

  /**
   * Returns a value indicating whether there is any handler attached to the specified class-level event.
   * Note that this method will also check all parent classes to see if there is any handler attached
   * to the named event.
   * @param name - The event name.
   * @returns Whether there is any handler attached to the event.
   */
  public static hasHandlers(name: string): boolean {
    return Event._events.has(name);
  }

  /**
   * Triggers a class-level event.
   * This method will cause invocation of event handlers that are attached to the named event
   * for the specified class and all its parent classes.
   * @param name - The event name.
   * @param event - The event parameter. If not set, a default Event object will be created.
   */
  public static async trigger(name: string, event: Event | null = null): Promise<void> {
    if (!Event._events.has(name) || !Event._events.get(name).size) {
      return;
    }

    if (!event) {
      event = new Event();
    }
    if (!event.sender) {
      event.sender = this;
    }

    event.handled = false;
    event.name = name;

    for await (const [handler, data] of Event._events.get(name).entries()) {
      event.data = data;

      if (typeof handler === 'string' && typeof handler !== undefined) {
        // global function
        await invoke(handler, [event, data]);
      }

      if (typeof handler === 'function') {
        // anonymous function
        await invoke(handler, [event, data]);
      }

      if (Array.isArray(handler)) {
        const [target, funcName] = handler;

        if ('string' === typeof target && target.startsWith('@')) {
          // module method
          await invokeModuleMethod(target, funcName, [event, data]);
        } else if ( ['object', 'function'].includes(typeof target)) {
          // object method or a static class method
          await invokeMethod(<object | Function>target, funcName, [event, data]);
        }

        throw new Error ('Handler must be be a valid function or a method');
      }

      // stop further handling if the event is handled
      if (event.handled) {
        return;
      }
    }
  }
}
