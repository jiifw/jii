/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {extname, sep} from 'node:path';

// classes
import View from './View';
import Module from './Module';
import Action from './Action';
import Request from './Request';
import Response from './Response';
import ActionEvent from './ActionEvent';
import InlineAction from './InlineAction';
import Component, {Props} from './Component';

// utils
import Jii from '~/Jii';
import {isFile} from '~/helpers/path';
import {actionName} from '~/helpers/inflector';
import {hasOwnMethod} from '~/helpers/reflection';
import {ltrim, strncmp, substr} from '~/helpers/string';

// types
import {Class} from 'utility-types';
import {ViewContextInterface} from './ViewContextInterface';

export interface Actions {
  [key: string]: string | {
    /** Class path, Object */
    class: string | Class<any>;
    [prop: string]: any;
  };
}

export default class Controller extends Component implements ViewContextInterface {
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
  public defaultAction: string = 'index';

  /**
   * The name of the layout to be applied to this controller's views.<br>
   * This property mainly affects the behavior of {@link render render()}.<br>
   * Defaults to null, meaning the actual layout value should inherit that from {@link module}'s layout value.
   * If false, no layout will be applied.
   */
  public layout: string | null | false = null;

  /**
   * The action that is currently being executed. This property will be set<br>
   * by {@link run run()} when it is called by {@link Application} to run an action.
   */
  public action: Action | null = null;

  /**
   * The request.
   */
  public request: Request | object | string = 'request';

  /**
   * The response.
   */
  public response: Response | object | string = 'response';

  /**
   * The view object that can be used to render views or view files.
   */
  private _view: View | null = null;

  /**
   * The root directory that contains view files for this controller.
   */
  private _viewPath: string | null = null;

  /**
   * All ancestor modules that this controller is located within.
   */
  public get modules(): Module[] {
    return this.getModules();
  }

  /**
   * The route (module ID, controller ID and action ID) of the current request.
   */
  public get route(): string {
    return this.getRoute();
  }

  /**
   * The controller ID that is prefixed with the module ID (if any).
   */
  public get uniqueId(): string {
    return this.getUniqueId();
  }

  /**
   * The directory containing the view files for this controller.
   */
  public get viewPath(): string {
    return this.getViewPath();
  }

  /**
   * The view object that can be used to render views or view files.
   */
  public get view(): View {
    return this.getView();
  }

  /**
   * Constructor.
   *
   * @param id - The ID of this controller.
   * @param module - The module that this controller belongs to.
   * @param props - Name-value pairs that will be used to initialize the object properties.
   */
  public constructor(id: string, module: Module, props: Props = {}) {
    super(props);
    this.id = id;
    this.module = module;
  }

  /**
   * @inheritDoc
   */
  public init(): void {
    super.init();
    this.request = Jii.app().get<Request>(this.request as string);
    this.response = Jii.app().get<Response>(this.response as string);
  }

  /**
   * Declares external actions for the controller.
   *
   * This method is meant to be overwritten to declare external actions for the controller.
   * It should return an array, with array keys being action IDs, and array values the corresponding
   * action class names or action configuration object. For example,
   *
   * ```
   * return {
   *     action1: '@app/components/Action1',
   *     action2: {
   *         class: '@app/components/Action2',
   *         property1: 'value1',
   *         property2: 'value2',
   *     },
   * };
   * ```
   *
   * {@link Jii.createObject Jii.createObject()} will be used later to create the requested action
   * using the configuration provided here.
   * @return Actions definition
   */
  public actions(): Actions {
    return {};
  }

  /**
   * Runs an action within this controller with the specified action ID and parameters.<br>
   * If the action ID is empty, the method will use {@link defaultAction}.
   * @param id - The ID of the action to be executed.
   * @param params - The parameters (name-value pairs) to be passed to the action.
   * @returns The result of the action.
   * @throws {InvalidRouteError} If the requested action ID cannot be resolved into an action successfully.
   * @see {@link createAction createAction()}
   */
  public async runAction<T = any>(id: string, params: { [key: string]: any } = {}): Promise<T> {
    return null;
  }

  /**
   * Runs a request specified in terms of a route.<br>
   * The route can be either an ID of an action within this controller or a complete route consisting<br>
   * of module IDs, controller ID and action ID. If the route starts with a slash '/', the parsing of<br>
   * the route will start from the application; otherwise, it will start from the parent module of this controller.
   * @param route - The route to be handled, e.g., 'view', 'comment/view', '/admin/comment/view'.
   * @param params - The parameters to be passed to the action.
   * @returns The result of the action.
   * @see {@link runAction runAction()}
   */
  public async run<T = any>(route, params: { [key: string]: any } = {}): Promise<T> {
    return null;
  }

  /**
   * Binds the parameters to the action.<br>
   * This method is invoked by {@link Action} when it begins to run with the given parameters.
   * @param action - The action to be bound with parameters.
   * @param params - The parameters to be bound to the action.
   * @returns The valid parameters that the action can run with.
   */
  public bindActionParams<T = any>(action: Action, params: any[] = []): T[] {
    return [];
  }

  /**
   * Creates an action based on the given action ID.
   * The method first checks if the action ID has been declared in {@link actions actions()}. If so,
   * it will use the configuration declared there to create the action object.
   * If not, it will look for a controller method whose name is in the format of `actionXyz`
   * where `xyz` is the action ID. If found, an {@link InlineAction} representing that
   * method will be created and returned.
   * @param id - The action ID.
   * @return The newly created action instance. Null if the ID doesn't resolve into any action.
   */
  public createAction(id: string): Action | null {
    if (id === '') {
      id = this.defaultAction;
    }

    const actionMap = this.actions();
    if (id in actionMap) {
      return Jii.createObject(actionMap[id], [id, this]);
    }

    if (/^(?:[a-z0-9_]+-)*[a-z0-9_]+$/.test(id)) {
      const methodName = actionName(id);
      if (hasOwnMethod(this, methodName)) {
        return new InlineAction(id, this, methodName);
      }
    }

    return null;
  }

  /**
   * This method is invoked right before an action is executed.
   *
   * The method will trigger the {@link EVENT_BEFORE_ACTION} event. The return value of the method<br>
   * will determine whether the action should continue to run.
   *
   * In case the action should not run, the request should be handled inside the `beforeAction` code<br>
   * by either providing the necessary output or redirecting the request. Otherwise, the response will be empty.
   *
   * If you override this method, your code should look like the following:
   *
   * ```
   * public async beforeAction(action) {
   *   // your custom code here, if you want the code to run before action filters,
   *   // which are triggered on the `Controller.EVENT_BEFORE_ACTION` event, e.g. PageCache or AccessControl
   *
   *   if (!super.beforeAction($action)) {
   *       return false;
   *   }
   *
   *   // other custom code here
   *
   *   return true; // or false to not run the action
   * }
   * ```
   *
   * @param action - The action to be executed.
   * @returns Whether the action should continue to run.
   */
  public async beforeAction(action: Action): Promise<boolean> {
    const event = new ActionEvent(action);
    this.trigger(Controller.EVENT_BEFORE_ACTION, event);
    return event.isValid;
  }

  /**
   * This method is invoked right after an action is executed.
   *
   * The method will trigger the {@link EVENT_AFTER_ACTION} event. The return value of the method<br>
   * will be used as the action return value.
   *
   * If you override this method, your code should look like the following:
   *
   * ```
   * public async afterAction(action, result)
   * {
   *     const result = super.afterAction(action, result);
   *     // your custom code here
   *     return result;
   * }
   * ```
   *
   * @param action - The action just executed.
   * @param result - The action return result.
   * @returns The processed action result.
   */
  public async afterAction<T = any>(action: Action, result: any): Promise<T> {
    const event = new ActionEvent(action);
    event.result = result;
    this.trigger(Controller.EVENT_AFTER_ACTION, event);
    return event.result;
  }

  /**
   * Returns all ancestor modules of this controller.<br>
   * The first module in the array is the outermost one (i.e., the application instance),<br>
   * while the last is the innermost one.
   * @return All ancestor modules that this controller is located within.
   */
  public getModules(): Module[] {
    const modules = [this.module];
    let module = this.module;
    while (module.module !== null) {
      modules.unshift(module.module);
      module = module.module;
    }

    return modules;
  }

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

  /**
   * Returns the route of the current request.
   * @returns The route (module ID, controller ID and action ID) of the current request.
   */
  public getRoute(): string {
    return this.action !== null ? this.action.getUniqueId() : this.getUniqueId();
  }

  /**
   * Renders a view and applies layout if available.
   *
   * @param view - The view name.
   * @param params - The parameters (name-value pairs) that should be made available in the view.
   * These parameters will not be available in the layout.
   * @returns The rendering result.
   * @throws {InvalidArgumentError} - if the view file or the layout file does not exist.
   */
  public async render(view, params: { [key: string]: any } = {}): Promise<any> {
    const content = await this.getView().render(view, params, this);
    return this.renderContent(content);
  }

  /**
   * Renders a static string by applying a layout.
   * @param content the static string being rendered
   * @return string the rendering result of the layout with the given static string as the `$content` variable.
   * If the layout is disabled, the string will be returned back.
   * @since 2.0.1
   */
  public async renderContent(content: string): Promise<any> {
    const layoutFile = this.findLayoutFile(this.getView());
    if (layoutFile !== false) {
      return this.getView().renderFile(layoutFile, {content}, this);
    }

    return content;
  }

  /**
   * Renders a view without applying layout.<br>
   * This method differs from {@link render render()} in that it does not apply any layout.
   * @param view - The view name. Please refer to {@link render render()} on how to specify a view name.
   * @param params - The parameters (name-value pairs) that should be made available in the view.
   * @return string the rendering result.
   * @throws {InvalidArgumentError} - If the view file does not exist.
   */
  public async renderPartial(view: string, params: { [key: string]: any } = {}): Promise<any> {
    return this.getView().render(view, params, this);
  }

  /**
   * Renders a view file.
   * @param file - The view file to be rendered. This can be either a file path or a path alias.
   * @param params - The parameters (name-value pairs) that should be made available in the view.
   * @returns The rendering result.
   * @throws {InvalidArgumentError} - If the view file does not exist.
   */
  public async renderFile(file: string, params: { [key: string]: any } = {}) {
    return this.getView().renderFile(file, params, this);
  }

  /**
   * Returns the view object that can be used to render views or view files.
   * The {@link render render()}, {@link renderPartial renderPartial()} and {@link renderFile renderFile()} methods will use
   * this view object to implement the actual view rendering.
   * If not set, it will default to the "view" application component.
   * @returns The view object that can be used to render views or view files.
   */
  public getView(): View {
    if (this._view === null) {
      this._view = Jii.app().getView();
    }

    return this._view;
  }

  /**
   * Sets the view object to be used by this controller.
   * @param view - The view object that can be used to render views or view files.
   */
  public setView(view: View): void {
    this._view = view;
  }

  /**
   * Returns the directory containing view files for this controller.<br>
   * The default implementation returns the directory named as controller {@link id} under the {@link module}'s
   * {@link viewPath} directory.
   * @returns The directory containing the view files for this controller.
   */
  public getViewPath(): string {
    if (this._viewPath === null) {
      this._viewPath = this.module.getViewPath() + sep + this.id;
    }

    return this._viewPath;
  }

  /**
   * Sets the directory that contains the view files.
   * @param path - The root directory of view files.
   * @throws {InvalidArgumentError} If the directory is invalid
   */
  public setViewPath(path: string): void {
    this._viewPath = Jii.getAlias(path);
  }

  /**
   * Finds the applicable layout file.
   * @param view - The view object to render the layout file.
   * @returns The layout file path, or false if layout is not needed.
   * Please refer to {@link render render()} on how to specify this parameter.
   * @throws {InvalidArgumentError} If an invalid path alias is used to specify the layout.
   */
  public findLayoutFile(view: View): string | false {
    let module = this.module;
    let layout = null;

    if ('string' === typeof this.layout) {
      layout = this.layout;
    } else if (this.layout === null) {
      while (module !== null && module.layout === null) {
        module = module.module;
      }
      if (module && 'string' === typeof module.layout) {
        layout = module.layout;
      }
    }

    if (layout === null) {
      return false;
    }

    let file: string = '';

    if (strncmp(layout, '@', 1) === 0) {
      file = Jii.getAlias(layout);
    } else if (strncmp(layout, '/', 1) === 0) {
      file = Jii.app().getLayoutPath() + sep + substr(layout, 1);
    } else {
      file = module?.getLayoutPath() + sep + layout;
    }

    if (extname(file) !== '') {
      return file;
    }

    let path: string = file + '.' + view.defaultExtension;
    if (view.defaultExtension !== 'js' && !isFile(path)) {
      path = file + '.js';
    }

    return path;
  }
}
