/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Component from './Component';
import Module from './Module';

// utils
import {ltrim} from '../helpers/string';
import Response from './Response';
import Request from './Request';
import Action from './Action';

export default class Controller extends Component {
  /**
   * Event {@link ActionEvent} an event raised right before executing a controller action.<br>
   * You may set {@link ActionEvent#isValid ActionEvent.isValid} to be false to cancel the action execution.
   */
  public static readonly EVENT_BEFORE_ACTION: string = 'beforeAction';

  /**
   * Event {@link ActionEvent} an event raised right after executing a controller action.
   */
  public static readonly EVENT_AFTER_ACTION: string = 'afterAction';

  /**
   * An ID that uniquely identifies this module among other modules which have the same {@link module}.
   */
  public id: string;

  /**
   * The parent module of this module. `null` if this module does not have a parent.
   */
  public module: Module | null = null;

  /**
   * The ID of the action that is used when the action ID is not specified<br>
   * in the request. Defaults to `'index'`.
   */
  public defaultAction = 'index';

  /**
   * The name of the layout to be applied to this controller's views.<br>
   * This property mainly affects the behavior of {@link render render()}.<br>
   * Defaults to null, meaning the actual layout value should inherit that from {@link module}'s layout value.
   * If false, no layout will be applied.
   */
  public layout: string|null|false = null;

  /**
   * The action that is currently being executed. This property will be set<br>
   * by {@link run run()} when it is called by {@link Application} to run an action.
   */
  public action: Action|null = null;

  /**
   * The request.
   */
  public request: Request | object | string = 'request';

  /**
   * The response.
   */
  public response: Response | object | string = 'response';

  /**
   * Returns an ID that uniquely identifies this module among all modules within the current application.
   * Note that if the module is an application, an empty string will be returned.
   * @return The unique ID of the module.
   */
  public getUniqueId(): string {
    return this.module
      ? ltrim(this.module.getUniqueId() + '/' + this.id, '/')
      : this.id;
  }
}
