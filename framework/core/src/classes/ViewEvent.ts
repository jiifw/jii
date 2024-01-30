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
 * ViewEvent represents events triggered by the {@link View]} component.
 */
export default class ViewEvent extends Event {
  /**
   * The view file being rendered.
   */
  public viewFile: string = null;

  /**
   * The parameter array passed to the {@link View.render View.render()} method.
   */
  public params: Record<string, any> = {};

  /**
   * The rendering result of {@link View.renderFile View.renderFile()}.<br>
   * Event handlers may modify this property and the modified output will be<br>
   * returned by {@link View.renderFile View.renderFile()}. This property is only used<br>
   * by {@link View.EVENT_AFTER_RENDER} event.
   */
  public output: string = null;

  /**
   * Whether to continue rendering the view file. Event handlers of<br>
   * {@link View.EVENT_BEFORE_RENDER} may set this property to decide whether<br>
   * to continue rendering the current view file.
   */
  public isValid: boolean = true;
}
