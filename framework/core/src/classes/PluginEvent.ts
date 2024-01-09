/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Event from './Event';

/**
 * The event class for the plugin.
 */
export default class PluginEvent extends Event {
  /**
   * The action result. Event handlers may modify this property to change the plugin result.
   */
  public result: any;

  /**
   * Whether to continue running the action. Event handlers of<br>
   * {@link Plugin#EVENT_BEFORE_REGISTER Plugin.EVENT_BEFORE_REGISTER} may set this property to decide whether<br>
   * to continue running the current action.
   */
  public isValid: boolean = true;
}
