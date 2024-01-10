/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import BaseObject from './BaseObject';

// types
import Component, {Instance as ComponentInstance, EventHandler} from './Component';

// public types
export type Instance = InstanceType<typeof Behavior>;
export type BehaviorArgs = | string | Instance | { class: string; [key: string]: any };

/**
 * Behavior is the base class for all behavior classes.
 *
 * A behavior can be used to enhance the functionality of an existing component without modifying its code.
 * In particular, it can "inject" its own methods and properties into the component
 * and make them directly accessible via the component. It can also respond to the events triggered in the component
 * and thus intercept the normal code execution.
 *
 * @see https://github.com/yiisoft/yii2/blob/master/framework/base/Behavior.php
 */
export default class Behavior extends BaseObject {
  /**
   * The owner of this behavior
   */
  public owner: ComponentInstance | null;

  /**
   * Array Attached events handlers
   */
  private _attachedEvents: Record<string, EventHandler> = {};

  /**
   * Declares event handlers for the {@link owner}'s events.
   *
   * Child classes may override this method to declare what callbacks should
   * be attached to the events of the {@link owner} component.
   *
   * The callbacks will be attached to the {@link owner}'s events when the behavior is
   * attached to the owner; and they will be detached from the events when
   * the behavior is detached from the component.
   *
   * The callbacks can be any of the following:
   *
   * 1. <code style="color:#B87333">async (event: Event, data: any): Promise<void> => { ... }</code> // Anonymous async function
   * 2. <code style="color:#B87333">(event: Event, data: any): void => { ... }</code> // Anonymous sync function
   * 3. <code style="color:#B87333">[instance, 'handleAdd']</code> // object method
   * 4. <code style="color:#B87333">[Page, 'handleAdd']</code> // static class method
   * 4. <code style="color:#B87333">['@app/classes/Page', 'handleAdd']</code> // alias based class path
   * 6. <code style="color:#B87333">'handleAdd'</code> // global function
   *
   * The following is an example:
   *
   * ```js
   * {
   *     [Model.EVENT_BEFORE_VALIDATE]: 'myBeforeValidate',
   *     [Model.EVENT_AFTER_VALIDATE]: 'myAfterValidate',
   * }
   * ```
   *
   * @returns events (object keys) and the corresponding event handler methods (object values).
   */
  public events(): Record<string, EventHandler> {
    return {};
  }

  /**
   * Attaches the behavior object to the component.<br>
   * The default implementation will set the {@link owner} property<br>
   * and attach event handlers as declared in {@link events}<br>
   * Make sure you call the parent implementation if you override this method.<br>
   * @param owner - The component that this behavior is to be attached to.
   */
  public attach(owner: ComponentInstance): void {
    this.owner = owner;
    const _events = Object.entries(this.events());

    if (!_events.length) {
      return;
    }

    for (const [event, handler] of _events) {
      this._attachedEvents[event] = handler;
      owner.on(event, 'string' === typeof handler ? [this, handler] : handler);
    }
  }

  /**
   * Detaches the behavior object from the component.<br>
   * The default implementation will unset the {@link owner} property<br>
   * and detach event handlers declared in {@link events}.<br>
   * Make sure you call the parent implementation if you override this method.
   */
  public detach(): void {
    if (!this.owner || !(this.owner instanceof Component)) {
      return;
    }

    for (const [event, handler] of Object.entries(this._attachedEvents)) {
      this.owner.off(event, 'string' === typeof handler ? [this, handler] : handler);
    }

    this._attachedEvents = {};
    this.owner = null;
  }
}
