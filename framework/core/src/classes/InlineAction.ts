/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Action from './Action';
import Controller from './Controller';

// utils
import Jii from '~/Jii';
import {invokeMethod} from '~/helpers/function';

// types
import {Props} from './BaseObject';

/**
 * InlineAction represents an action that is defined as a controller method.
 *
 * The name of the controller method is available via {@link actionMethod} which<br>
 * is set by the {@link controller} who creates this action.
 */
export default class InlineAction extends Action {
  /**
   * The controller method that this inline action is associated with
   */
  public actionMethod: string = null;

  /**
   * @param id - The ID of this action
   * @param controller - The controller that owns this action
   * @param actionMethod - The controller method that this inline action is associated with
   * @param props - Name-value pairs that will be used to initialize the object properties
   */
  public constructor(id: string, controller: Controller, actionMethod: string, props: Props = {}) {
    super(id, controller, props);
    this.actionMethod = actionMethod;
    this.init();
  }

  /**
   * Runs this action with the specified parameters.<br>
   * This method is mainly invoked by the controller.
   * @param params - Action parameters
   * @return The result of the action
   */
  public async runWithParams<T = any>(params: any[]): Promise<T> {
    const args = this.controller.bindActionParams(this, params);

    if (Jii.app().requestedParams === null) {
      Jii.app().requestedParams = args;
    }

    return invokeMethod(this.controller, this.actionMethod, args);
  }
}
