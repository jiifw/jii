/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Controller from './Controller';
import Component, {Props} from './Component';
import InvalidConfigError from './InvalidConfigError';

// utils
import Jii from '~/Jii';
import {invokeMethod} from '~/helpers/function';
import {hasOwnMethod} from '~/helpers/reflection';

/**
 * Action is the base class for all controller action classes.
 *
 * Action provides a way to reuse action method code. An action method in an Action
 * class can be used in multiple controllers or in different projects.
 *
 * Derived classes must implement a method named `run()`. This method
 * will be invoked by the controller when the action is requested.
 *
 * The `run()` method can have parameters which will be filled up
 * with user input values automatically according to their names.
 * For example, if the `run()` method is declared as follows:
 *
 * ```js
 * public run(id: string, type: string = 'book') { ... }
 * ```
 *
 * And the parameters provided for the action are: `{id: 1}`.<br>
 * Then the `run()` method will be invoked as `run(1)` automatically.
 */
export default class Action<C extends Controller = Controller> extends Component {
  /**
   * ID of the action
   */
  public id: string = null;

  /**
   * The controller that owns this action
   */
  public controller: C = null;

  /**
   * Constructor.
   *
   * @param id - The ID of this action
   * @param controller - The controller that owns this action
   * @param config - Name-value pairs that will be used to initialize the object properties
   */
  public constructor(id: string, controller: C, config: Props = {}) {
    super(config);
    this.id = id;
    this.controller = controller;
  }

  /**
   * Returns the unique ID of this action among the whole application.
   */
  public getUniqueId(): string {
    return this.controller.getUniqueId() + '/' + this.id;
  }

  /**
   * Runs this action with the specified parameters.<br>
   * This method is mainly invoked by the controller.
   *
   * @param params - The parameters to be bound to the action's run() method.
   * @returns The result of the action
   * @throws {InvalidConfigError} - If the action class does not have a run() method
   */
  public async runWithParams<T = any>(params: any[]): Promise<T> {
    if (!hasOwnMethod(this, 'run')) {
      throw new InvalidConfigError(this.constructor.name + ' must define a "run()" method.');
    }

    const args = this.controller.bindActionParams(this, params);

    if (Jii.app().requestedParams === null) {
      Jii.app().requestedParams = args;
    }

    if (await this.beforeRun()) {
      const result = await invokeMethod(this, 'run', args);
      await this.afterRun();

      return result;
    }

    return null;
  }

  /**
   * This method is called right before `run()` is executed.
   * You may override this method to do preparation work for the action run.
   * If the method returns false, it will cancel the action.
   *
   * @return Whether to run the action.
   */
  protected async beforeRun(): Promise<boolean> {
    return true;
  }

  /**
   * This method is called right after `run()` is executed.
   * You may override this method to do post-processing work for the action run.
   */
  protected async afterRun(): Promise<void> {
  }
}
