/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Component from './Component';
import ViewEvent from './ViewEvent';

// types
import {ViewContextInterface} from './ViewContextInterface';

/**
 * View represents a view object in the MVC pattern.
 *
 * View provides a set of methods (e.g. {@link render render()} for rendering purpose.
 */
export default class View extends Component {
  /**
   * Event that is triggered by {@link renderFile renderFile()} right before it renders a view file.
   * @see ViewEvent
   */
  public static readonly EVENT_BEFORE_RENDER: string = 'beforeRender';

  /**
   * An event that is triggered by {@link renderFile renderFile()} right after it renders a view file.
   * @see ViewEvent
   */
  public static readonly EVENT_AFTER_RENDER: string = 'afterRender';

  /**
   * The context under which the {@link renderFile renderFile()} method is being invoked.
   */
  public context: ViewContextInterface = null;

  /**
   * Custom parameters that are shared among view templates.
   */
  public params: Record<string, any> = {};

  /**
   * The default view file extension. This will be appended to view file names if they don't have file extensions.
   */
  public defaultExtension: string = 'js';

  /**
   * @var array the view files currently being rendered. There may be multiple view files being
   * rendered at a moment because one view may be rendered within another.
   */
  private _viewFiles: Record<string, string> = {};

  public async render(view, params: Record<string, any> = {}, context: object = null): Promise<any> {
    const viewFile = this.findViewFile(view, context);
    return this.renderFile(viewFile, params, context);
  }

  protected findViewFile(view: string, context: object = null): string {
    // todo: implement logic here
    return '';
  }

  public async renderFile(viewFile: string, params: Record<string, any> = {}, context: object = null): Promise<any> {
    // todo: implement logic here
  }

  /**
   * @return The view file currently being rendered. False if no view file is being rendered.
   */
  public getViewFile(): string | boolean {
    return !Object.keys(this._viewFiles).length ? false : this._viewFiles['resolved'];
  }

  /**
   * This method is invoked right before [[renderFile()]] renders a view file.
   * The default implementation will trigger the [[EVENT_BEFORE_RENDER]] event.
   * If you override this method, make sure you call the parent implementation first.
   * @param viewFile the view file to be rendered.
   * @param params the parameter array passed to the [[render()]] method.
   * @return bool whether to continue rendering the view file.
   */
  public async beforeRender(viewFile: string, params: Record<string, any> = {}): Promise<boolean> {
    const event = new ViewEvent({
      viewFile: viewFile,
      params: params,
    });

    await this.trigger(View.EVENT_BEFORE_RENDER, event);
    return event.isValid;
  }

  /**
   * This method is invoked right after {@link renderFile renderFile()} renders a view file.<br>
   * The default implementation will trigger the {@link EVENT_AFTER_RENDER} event.<br>
   * If you override this method, make sure you call the parent implementation first.
   * @param viewFile - The view file being rendered.
   * @param params - The parameter array passed to the {@link render} method.
   * @param output - The rendering result of the view file. Updates to this parameter
   * will be passed back and returned by {@link renderFile}.
   */
  public async afterRender(viewFile: string, params: Record<string, any>, output: string): Promise<void> {
    if (this.hasEventHandlers(View.EVENT_AFTER_RENDER)) {
      const event = new ViewEvent({
        viewFile: viewFile,
        params: params,
      });
      event.output = output;
      await this.trigger(View.EVENT_AFTER_RENDER, event);
    }
  }
}
