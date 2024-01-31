/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {sep} from 'node:path';

// classes
import Action from './Action';
import Instance from './Instance';
import Controller from './Controller';
import ActionEvent from './ActionEvent';
import ServiceLocator from './ServiceLocator';
import InvalidRouteError from './InvalidRouteError';
import InvalidConfigError from './InvalidConfigError';
import InvalidArgumentError from './InvalidArgumentError';

// utils
import Jii from '../Jii';
import {isEnvironment} from '../env';
import {classname} from '../helpers/inflector';
import {dirname, isDir} from '../helpers/path';
import {ltrim, strpos, strrpos, substr, trim} from '../helpers/string';

// types
import {Props} from './BaseObject';
import {ModuleDefinition, ModulesDefinition} from '../typings/modules';

/**
 * Module is the base class for module and application classes.
 *
 * A module represents a sub-application which contains MVC elements by itself, such as
 * models, views, controllers, etc.
 *
 * A module may consist of {@link modules}
 *
 * {@link components} may be registered with the module so that they are globally
 * accessible within the module.
 */
export default class Module extends ServiceLocator {
  /**
   * An event raised before executing a controller action.
   * You may set {@link ActionEvent.isValid} to be `false` to cancel the action execution.
   * @event ActionEvent
   */
  public static readonly EVENT_BEFORE_ACTION: string = 'beforeAction';

  /**
   * An event raised after executing a controller action.
   * @event ActionEvent
   */
  public static readonly EVENT_AFTER_ACTION: string = 'afterAction';

  /**
   * Custom module parameters {name: value}.
   */
  public params: Record<string, any> = {};

  /**
   * An ID that uniquely identifies this module among other modules which have the same {@link module module|parent module}.
   */
  public id: string;

  /**
   * The parent module of this module. `null` if this module does not have a parent.
   */
  public module: Module | null = null;

  /**
   * The layout that should be applied for views within this module. This refers to a view name
   * relative to {@link getLayoutPath getLayoutPath()}. If this is not set, it means the layout value of the {@link module module|parent module}
   * will be taken. If this is `false`, layout will be disabled within this module.
   */
  public layout: string | boolean = null;

  /**
   * Mapping from controller ID to controller configurations.
   *
   * Each name-value pair specifies the configuration of a single controller.
   * A controller configuration can be either a string or an array.
   *
   * - If the former, the string should be the fully qualified class name of the controller.
   * - If the latter, the array must contain a `class` element which specifies
   * the controller's fully qualified class name, and the rest of the name-value pairs
   *
   * in the array are used to initialize the corresponding controller properties. For example,
   *
   * ```
   * {
   *   account: 'app/controllers/UserController',
   *   article: {
   *      class: 'app/controllers/PostController',
   *      pageTitle: 'something new',
   *   },
   * }
   * ```
   */
  public controllerMap: { [id: string]: string | { class: string; [name: string]: any } } = {};

  /**
   * The default route of this module. Defaults to `default`.<br>
   * The route may consist of child module ID, controller ID, and/or action ID.<br>
   * For example, `help`, `post/create`, `admin/post/create`.<br>
   * If action ID is not given, it will take the default value as specified in<br>
   * {@link Controller.defaultAction}.
   */
  public defaultRoute: string = 'default';

  /**
   * The root directory of the module.
   */
  private _basePath: string = null;

  /**
   * @var string The root directory that contains the controller classes for this module.
   */
  private _controllerPath: string = null;

  /**
   * The root directory that contains view files for this module
   */
  private _viewPath: string = null;

  /**
   * The root directory that contains layout view files for this module.
   */
  private _layoutPath: string = null;

  /**
   * Child modules of this module
   */
  private _modules: Map<string, Module | ModuleDefinition> = new Map;

  /**
   * The version of this module.<br>
   * Version can be specified as a callback, which can accept module instance as an argument and should<br>
   * return the actual version. For example:
   *
   * ```js
   * (module: Module): string => {
   *     //return string
   * }
   * ```
   *
   * If not set, {@link defaultVersion defaultVersion()} will be used to determine actual value.
   */
  private _version: string | ((module: Module) => string) | null = null;

  /**
   * Constructor.
   * @param id - The ID of this module.
   * @param [parent] - The parent module (if any).
   * @param [config] - Name-value pairs that will be used to initialize the object properties.
   */
  public constructor(id: string, parent: Module = null, config: Props = {}) {
    super(config);
    this.id = id;
    this.module = parent;
    this.init();
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
   * Returns the root directory of the module.
   * It defaults to the directory containing the module class file.
   * @returns The root directory of the module.
   */
  public getBasePath(): string {
    if (this._basePath === null) {
      this._basePath = dirname(this.getControllerPath());
    }

    return this._basePath;
  }

  /**
   * Sets the root directory of the module.
   * @param path - The root directory of the module.
   */
  public setBasePath(path: string): void {
    path = Jii.getAlias(path);
    if ('string' === typeof path && isDir(path)) {
      this._basePath = path;
    } else {
      throw new InvalidArgumentError(`The directory does not exist: ${path}`);
    }
  }

  /**
   * Returns the directory that contains the controller classes according to {@link getBasePath getBasePath()}.<br>
   * **Note** that in order for this method to return a value, you must define
   * an alias for the root namespace of {@link getBasePath getBasePath()}.
   * @return string the directory that contains the controller classes.
   * @throws {InvalidArgumentError} if there is no alias defined for the root namespace of {@link getBasePath getBasePath()}.
   */
  public getControllerPath(): string {
    if (this._controllerPath === null) {
      this._controllerPath = this.getBasePath().concat(sep, 'controllers');
    }

    return this._controllerPath;
  }

  /**
   * Sets the directory that contains the controller classes.
   * @param path - The root directory that contains the controller classes.
   * @throws {InvalidArgumentError} If the directory is invalid.
   */
  public setControllerPath(path): void {
    this._controllerPath = Jii.getAlias(path);
  }

  /**
   * Returns the directory that contains the view files for this module.
   * @returns The root directory of view files. Defaults to "{@link basePath}/views".
   */
  public getViewPath(): string {
    if (this._viewPath === null) {
      this._viewPath = this.getBasePath().concat(sep, 'views');
    }

    return this._viewPath;
  }

  /**
   * Returns the directory that contains the view files for this module.
   * @see {@link getViewPath getViewPath()}
   */
  public get viewPath(): string {
    return this._viewPath;
  }

  /**
   * Sets the directory that contains the view files.
   * @param path - The root directory of view files.
   * @throws {InvalidArgumentError} If the directory is invalid.
   */
  public setViewPath(path: string): void {
    path = Jii.getAlias(path);
    if ('string' === typeof path && isDir(path)) {
      this._viewPath = path;
    } else {
      throw new InvalidArgumentError(`The directory does not exist: ${path}`);
    }
  }

  /**
   * Returns the directory that contains layout view files for this module.
   * @return The root directory of layout files. Defaults to "{@link viewPath}/layouts".
   */
  public getLayoutPath(): string {
    if (this._layoutPath === null) {
      this._layoutPath = this.getViewPath().concat(sep, 'layouts');
    }

    return this._layoutPath;
  }

  /**
   * Sets the directory that contains the layout files.
   * @param path - The root directory or path alias of layout files.
   * @throws {InvalidArgumentError} If the directory is invalid.
   */
  public setLayoutPath(path: string): void {
    path = Jii.getAlias(path);
    if ('string' === typeof path && isDir(path)) {
      this._layoutPath = path;
    } else {
      throw new InvalidArgumentError(`The directory does not exist: ${path}`);
    }
  }

  /**
   * Returns current module version.
   * If version is not explicitly set, {@link defaultVersion defaultVersion()} method will be used to determine its value.
   * @returns The version of this module.
   */
  public getVersion(): string {
    if (this._version === null) {
      this._version = this.defaultVersion();
    } else if (typeof this._version === 'function') {
      this._version = this._version(this);
    }

    return this._version;
  }

  /**
   * Sets current module version.
   * @param version the version of this module.
   * Version can be specified as a callback, which can accept module instance as an argument and should
   * @returns The actual version. For example:
   *
   * ```js
   * (module: Module): string {
   *     //return '2.0';
   * }
   * ```
   */
  public setVersion(version: string | ((module: Module) => string) | null): void {
    this._version = version;
  }

  /**
   * Returns default module version.
   * Child class may override this method to provide more specific version detection.
   * @returns The version of this module.
   */
  protected defaultVersion(): string {
    return this.module?.getVersion() ?? '1.0';
  }

  /**
   * Defines path aliases.<br>
   * This method calls {@link Jii.setAlias Jii.setAlias()} to register the path aliases.<br>
   * This method is provided so that you can define path aliases when configuring a module.<br>
   * See {@link Jii.setAlias Jii.setAlias() for an example.
   * @param aliases - List of path aliases to be defined. The array keys are alias names
   * (must start with `@`) and the object values are the corresponding paths or aliases.
   * For example,
   *
   * ```js
   * {
   *   '@models': '@app/models', // an existing alias
   *   '@backend': __dirname . '/../backend',  // a directory
   * }
   * ```
   */
  public setAliases(aliases: Record<string, string>): void {
    for (const [name, value] of Object.entries(aliases)) {
      Jii.setAlias(name, value);
    }
  }

  /**
   * Checks whether the child module of the specified ID exists.
   * This method supports checking the existence of both child and grand child modules.
   * @param id - Module ID. For grand child modules, use ID path relative to this module (e.g. `admin/content`).
   * @return bool whether the named module exists. Both loaded and unloaded modules
   * are considered.
   */
  public hasModule(id): boolean {
    const pos: number | false = strpos(id, '/');

    if (pos !== false) {
      // sub-module
      const module = this.getModule(substr(id, 0, pos)) as Module;

      return module === null ? false : module.hasModule(substr(id, pos + 1));
    }

    return this._modules.has(id);
  }

  /**
   * Retrieves the child module of the specified ID.
   * This method supports retrieving both child modules and grand child modules.
   * @param id - Module ID (case-sensitive). To retrieve grand child modules,
   * use ID path relative to this module (e.g. `admin/content`).
   * @param load - Whether to load the module if it is not yet loaded.
   * @return Module|null the module instance, `null` if the module does not exist.
   * @see hasModule()
   */
  public getModule<T extends Module = Module>(id, load: boolean = true): T | null {
    const pos: number | false = strpos(id, '/');

    if (pos !== false) {
      // sub-module
      const module = this.getModule(substr(id, 0, pos));

      return module === null ? null : module.getModule(substr(id, pos + 1), load);
    }

    if (this._modules.has(id)) {
      if (this._modules.get(id) instanceof Module) {
        return this._modules.get(id) as T;
      } else if (load) {
        const definition = this._modules.get(id) as ModuleDefinition;
        const module = Jii.createObject<Module>(definition, [id, this]);
        if (definition?.components) {
          module.setComponents(definition.components);
        }
        if (definition?.params) {
          module.params = definition.params;
        }
        return this._modules.set(id, module).get(id) as T;
      }
    }

    return null;
  }

  /**
   * Adds a submodules to this module.
   * @param id - Module ID.
   * @param module the submodules to be added to this module. This can
   * be one of the following:
   *
   * - a {@link Module} object
   * - a configuration object: when {@link getModule getModule()} is called initially, the array
   *   will be used to instantiate the submodules
   * - `null`: the named submodules will be removed from this module
   */
  public setModule(id: string, module: Module | ModuleDefinition | null): void {
    if (module === null) {
      this._modules.delete(id);
    } else {
      this._modules.set(id, module);
      if (module instanceof Module) {
        module.module = this;
      }
    }
  }

  /**
   * Returns the submodules in this module.
   * @param loadedOnly - Whether to return the loaded submodules only. If this is set `false`,
   * then all submodules registered in this module will be returned, whether they are loaded or not.
   * Loaded modules will be returned as objects, while unloaded modules as configuration arrays.
   * @returns The modules (indexed by their IDs).
   * @see {@link getModule getModule()}
   */
  public getModules(loadedOnly: boolean = false): Record<string, Module | ModuleDefinition> {
    if (loadedOnly) {
      const modules: Record<string, Module> = {};

      for (const [id, module] of this._modules.entries()) {
        if (module instanceof Module) {
          modules[id] = module;
        }
      }

      return modules;
    }
8
    return Object.fromEntries(this._modules.entries());
  }

  /**
   * Registers submodules in the current module.
   *
   * Each submodule should be specified as a name-value pair, where
   * name refers to the ID of the module and value the module or a configuration
   * array that can be used to create the module. In the latter case, {@link Jii.createObject Jii.createObject()}
   * will be used to create the module.
   *
   * If a new submodules has the same ID as an existing one, the existing one will be overwritten silently.
   *
   * The following is an example for registering two submodules:
   *
   * ```
   * {
   *     comment: {
   *         class: '@app/modules/comment/CommentModule',
   *         db: 'db',
   *     },
   *     booking: {class: '@app/modules/booking/BookingModule'},
   * }
   * ```
   *
   * @param modules - Modules (id: module configuration or instances).
   * @throws {InvalidConfigError} If the module configuration is invalid.
   */
  public setModules(modules: ModulesDefinition): void {
    for (const [moduleId, moduleConfig] of Object.entries(modules)) {
      this._modules.set(moduleId, moduleConfig);
      if (moduleConfig instanceof Module) {
        moduleConfig.module = this;
      }
    }
  }

  /**
   * Runs a controller action specified by a route.<br>
   * This method parses the specified route and creates the corresponding child module(s), controller and action<br>
   * instances. It then calls {@link Controller.runAction Controller.runAction()} to run the action with the given parameters.<br>
   * If the route is empty, the method will use {@link defaultRoute}.
   * @param route - The route that specifies the action.
   * @param params - The parameters to be passed to the action
   * @return mixed the result of the action.
   * @throws {InvalidRouteError} If the requested route cannot be resolved into an action successfully.
   */
  public async runAction(route: string, params: { [key: string]: any } = {}): Promise<any> {
    // Create an array of parts by calling the createController method with the given route
    const parts = this.createController(route);

    // Check if the parts array is an actual array
    if (Array.isArray(parts)) {
      // Destructure the parts array into a controller and actionID
      const [controller, actionID] = parts as [Controller, string];

      // Save the current controller in a variable
      const oldController = Jii.app().controller;

      // Set the current controller to the new controller
      Jii.app().controller = controller;

      // Call the runAction method of the controller with the actionID and params
      const result = await controller.runAction(actionID, params);

      // If there was a previous controller, restore it
      if (oldController !== null) {
        Jii.app().controller = oldController;
      }

      // Return the result of the runAction method
      return result;
    }

    // If the parts array is not an actual array, throw an InvalidRouteError
    const id: string = this.getUniqueId();
    throw new InvalidRouteError('Unable to resolve the request "' + (id === '' ? route : id + '/' + route) + '".');
  }

  /**
   * Creates a controller instance based on the given route.
   *
   * The route should be relative to this module. The method implements the following algorithm
   * to resolve the given route:
   *
   * 1. If the route is empty, use {@link defaultRoute};
   * 2. If the first segment of the route is found in {@link controllerMap}, create a controller
   *    based on the corresponding configuration found in {@link controllerMap};
   * 3. If the first segment of the route is a valid module ID as declared in {@link modules},
   *    call the module's `{@link Module.createController createController()}` with the rest part of the route;
   * 4. The given route is in the format of `abc/def/xyz`. Try either `abc/DefController`
   *    or `abc/def/XyzController` class within the {@link getControllerPath controller path}.
   *
   * If any of the above steps resolves into a controller, it is returned together with the rest
   * part of the route which will be treated as the action ID. otherwise, `false` will be returned.
   *
   * @param route - The route consisting of module, controller and action IDs.
   * @return array|bool If the controller is created successfully, it will be returned together
   * with the requested action ID. Otherwise, `false` will be returned.
   * @throws {InvalidConfigError} If the controller class and its file do not match.
   */
  public createController(route: string): object | [Controller, string] | false {
    if (route === '') {
      route = this.defaultRoute;
    }

    // double slashes or leading/ending slashes may cause substr problem
    route = trim(route, '/');
    if (strpos(route, '/') !== false) {
      return false;
    }

    let id = '';

    if (strpos(route, '/') !== false) {
      const parsed = route.split('/', 2);
      id = parsed[0];
      route = parsed[1];
    } else {
      id = route;
      route = '';
    }

    // module and controller map take precedence
    if (id in this.controllerMap) {
      const controller = Jii.createObject(this.controllerMap[id], [id, this]);
      return [controller, route];
    }

    const module = this.getModule(id);
    if (module !== null) {
      return module.createController(route);
    }

    let pos;

    if ((pos = strrpos(route, '/')) !== false) {
      id += '/' + substr(route, 0, pos) as string;
      route = substr(route, pos + 1) as string;
    }

    let controller = this.createControllerByID(id);
    if (controller === null && route !== '') {
      controller = this.createControllerByID(id + '/' + route);
      route = '';
    }

    return controller === null ? false : [controller, route];
  }

  /**
   * Creates a controller based on the given controller ID.
   *
   * The controller ID is relative to this module. The controller class
   * should be under {@link getControllerPath getControllerPath()}
   *
   * Note that this method does not check {@link modules} or {@link controllerMap}
   *
   * @param id - The controller ID.
   * @returns The newly created controller instance, or `null` if the controller ID is invalid.
   * @throws {InvalidConfigError} if the controller class and its file name do not match.
   * This exception is only thrown when in debug mode.
   */
  public createControllerByID(id: string): Controller | null {
    let pos = strrpos(id, '/');
    let prefix: string | false = '';
    let className: string | false = '';
    if (pos === false) {
      prefix = '';
      className = id;
    } else {
      prefix = substr(id, 0, pos + 1) as string;
      className = substr(id, pos + 1) as string;
    }

    if (this.isIncorrectClassNameOrPrefix(className, prefix)) {
      return null;
    }

    if (this.getControllerPath() === null) {
      throw new InvalidConfigError('The controllerPath property must be set.');
    }

    className = classname(className) + 'Controller';
    className = this.getControllerPath().concat(sep, prefix, className);

    if (strpos(className, '-') !== false) {
      return null;
    }

    if (Instance.isSubclassOf(className, '@jiiRoot/classes/Controller')) {
      const controller = Jii.createObject(className, [id, this]) as Controller;
      return controller.constructor.name === className ? controller : null;
    }

    if (isEnvironment('development')) {
      throw new InvalidConfigError('Controller class must extend from @jiiRoot/classes/Controller.');
    }

    return null;
  }

  /**
   * Checks if class name or prefix is incorrect
   *
   * @param className - The class name
   * @param prefix - The prefix to check
   */
  private isIncorrectClassNameOrPrefix(className: string, prefix: string): boolean {
    if (!/^[a-z][a-z0-9\\-_]*$/.test(className)) {
      return true;
    }

    return prefix !== '' && /^[a-z0-9_/]+$/i.test(prefix);
  }

  /**
   * This method is invoked right before an action within this module is executed.
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
   * public async beforeAction(action): Promise<boolean>
   * {
   *     if (!super.beforeAction(action)) {
   *         return false;
   *     }
   *
   *     // your custom code here
   *
   *     return true; // or false to not run the action
   * }
   * ```
   *
   * @param action - The action to be executed.
   * @returns Whether the action should continue to be executed.
   */
  public async beforeAction(action: Action): Promise<boolean> {
    const event = new ActionEvent(action);
    this.trigger(Module.EVENT_BEFORE_ACTION, event);
    return event.isValid;
  }

  /**
   * This method is invoked right after an action within this module is executed.
   *
   * The method will trigger the {@link EVENT_BEFORE_ACTION} event. The return value of the method
   * will be used as the action return value.
   *
   * If you override this method, your code should look like the following:
   *
   * ```
   * public async afterAction(action: Action, result: any): Promise<any>
   * {
   *     result = await super.afterAction(action, result);
   *     // your custom code here
   *     return result;
   * }
   * ```
   *
   * @param action - The action just executed.
   * @param result - The action return result.
   * @returns The processed action result.
   */
  public async afterAction(action: Action, result: any): Promise<any> {
    const event = new ActionEvent(action);
    event.result = result;
    this.trigger(Module.EVENT_AFTER_ACTION, event);
    return event.result;
  }

  /**
   * @inheritDoc
   *
   * if a component isn't defined in the module, it will be looked up in the parent module.<br>
   * The parent module may be the application.
   */
  public get<T = Module>(id: string, throwException = true): T {
    if (!this.module) {
      return super.get<T>(id, throwException);
    }

    let component = super.get(id, false);
    if (!component) {
      component = this.module.get(id, throwException);
    }

    return component as T;
  }

  /**
   * @inheritdoc
   *
   * if a component isn't defined in the module, it will be looked up in the parent module.<br>
   * The parent module may be the application.
   */
  public has(id: string, checkInstance: boolean = false): boolean {
    return super.has(id, checkInstance) || (this.module?.has(id, checkInstance) ?? false);
  }
}
