/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import ServiceLocator from './ServiceLocator';
import {Props} from './BaseObject';

// utils
import {ltrim, strpos, substr} from '../helpers/string';
import InvalidArgumentError from './InvalidArgumentError';
import Jii from '../Jii';
import {isPath} from '../helpers/path';
import {ModuleDefinition} from '../typings/components';

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
export class Module extends ServiceLocator {
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
  public params: Record<string, any> = [];

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
   * relative to {@link layoutPath}. If this is not set, it means the layout value of the {@link module module|parent module}
   * will be taken. If this is `false`, layout will be disabled within this module.
   */
  public layout: string | boolean = null;

  /**
   * The root directory of the module.
   */
  private _basePath: string = null;

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
      this._basePath = __dirname;
    }

    return this._basePath;
  }

  /**
   * Sets the root directory of the module.
   * This method can only be invoked at the beginning of the constructor.
   * @param path - The root directory of the module. This can be either a directory name or a [path alias](guide:concept-aliases).
   * @throws {InvalidArgumentError} - If the directory does not exist.
   */
  public setBasePath(path: string): void {
    path = Jii.getAlias(path);
    if ('string' === typeof path && isPath(path, 'dir')) {
      this._basePath = path;
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
    } else {
      if ('function' === typeof this._version) {
        this._version = this._version.apply(null, [this]);
      }
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
  protected defaultVersion() {
    return this.module === null
      ? '1.0'
      : this.module.getVersion();
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
  public getModule(id, load: boolean = true): Module | null {
    const pos: number | false = strpos(id, '/');

    if (pos !== false) {
      // sub-module
      const module = this.getModule(substr(id, 0, pos));

      return module === null ? null : module.getModule(substr(id, pos + 1), load);
    }

    if (this._modules.has(id)) {
      if (this._modules.get(id) instanceof Module) {
        return this._modules.get(id) as Module;
      } else if (load) {
        const module = Jii.createObject<Module>(this._modules.get(id) as ModuleDefinition, [id, this]);
        return this._modules.set(id, module).get(id) as Module;
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

    return Object.fromEntries(this._modules.entries());
  }

  /**
   * Registers submodules in the current module.
   *
   * Each submodules should be specified as a name-value pair, where
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
   */
  public setModules(modules: ModuleDefinition): void {
    for (const [id, module] of Object.entries(modules)) {
      this._modules.set(id, module);
      if (module instanceof Module) {
        module.module = this;
      }
    }
  }

  /**
   * {@inheritdoc}
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
    return super.has(id, checkInstance) || (this.module?.has(id, checkInstance));
  }
}
