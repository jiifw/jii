/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Event from './Event';
import Action from './Action';

// types
import {Props} from './BaseObject';

/**
 * ActionEvent represents the event parameter used for an action event.
 *
 * By setting the {@link isValid} property, one may control whether to continue running the action.
 */
export default class ActionEvent extends Event {
  /**
   * The action currently being executed
   */
  public action: Action = null;

  /**
   * The action result. Event handlers may modify this property to change the action result.
   */
  public result: any = null;

  /**
   * Whether to continue running the action. Event handlers of
   * {@link Controller.EVENT_BEFORE_ACTION} may set this property to decide whether
   * to continue running the current action.
   */
  public isValid: boolean = true;

  /**
   * Constructor.
   * @param action - The action associated with this action event.
   * @param config - Name-value pairs that will be used to initialize the object properties
   */
  public constructor(action, config: Props = {}) {
    super(config);
    this.action = action;
  }
}
