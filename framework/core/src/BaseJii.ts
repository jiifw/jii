/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import {bindClass} from './helpers/auto-bind';
import {aliases, getAlias, hasAlias, setAlias} from './base/aliases';
import {CONTAINER_APP_KEY, CONTAINER_PLUGINS_KEY, INTERNAL_METADATA} from './utils/symbols';

// script
import initCoreAliases from './scripts/init-core-aliases';

// classes
import Logger from './logger/Logger';
import Container, {ComponentConfig} from './classes/Container';
import PluginsContainer from './classes/PluginsContainer';
import InvalidCallError from './classes/InvalidCallError';

// types
import Application from './classes/Application';
import Instance, {ObjectType} from './classes/Instance';

// public types
export type AppInstance = InstanceType<typeof Application>;
export {ObjectType};

/**
 * BaseJii is the core helper class for the Jii framework.
 *
 * Do not use BaseJii directly. Instead, use its child module Yii which you can replace to
 * customize methods of BaseJii.
 */
export default abstract class BaseJii {
  /**
   * DI Container instance
   * @protected
   */
  protected _container: Container;

  /**
   * Logger instance
   * @protected
   */
  protected logger: Logger;

  /**
   * A constructor for the Jii class.
   */
  constructor() {
    this._container = new Container();
    this.logger = new Logger();
    this._container.memoSync(INTERNAL_METADATA, () => () => new Error('Inaccessible internal'), {freeze: true});
    this._container.memoSync(CONTAINER_PLUGINS_KEY, new PluginsContainer(), { freeze: true});
    bindClass(this);

    // initialize core aliases
    initCoreAliases(this);
  }

  /**
   * Get the list of registered aliases
   */
  get aliases() {
    return <Record<string, string>><unknown>aliases();
  }

  /**
   * Get application instance
   */
  app<T = AppInstance>(): T {
    return this._container.retrieve<T>(CONTAINER_APP_KEY);
  }

  /**
   * @return Container object
   */
  get container(): InstanceType<typeof Container> {
    return this._container;
  }

  /**
   * Returns middleware from container object
   */
  get plugins(): InstanceType<typeof PluginsContainer> {
    return this._container.retrieve(CONTAINER_PLUGINS_KEY);
  }

  /**
   * Returns component from container object
   * @param name - The name of the component
   * @returns Component instance
   */
  get<T>(name: string): T {
    if (!this._container.exists(name)) {
      throw new InvalidCallError(`Component ${name} not found in container`);
    }

    return this._container.retrieve<T>(name);
  }

  /**
   * Checks component existence in container object
   * @param name - The name of the component
   * @returns Whether component is present in container
   */
  has(name: string): boolean {
    return this._container.exists(name);
  }

  /**
   * Registers component inside container object
   * @param name - The name of the component
   * @param data - Component instance / data / async or sync function output to memoize
   * @param [options] - Component configuration
   * @see For setting component synchronously, check {@link setSync setSync()}
   */
  async set(
    name: string, data: object | (() => object) | (() => Promise<object>), options: Partial<ComponentConfig> = {},
  ): Promise<void> {
    await this._container.memo(name, data, options);
  }

  /**
   * Registers component inside container object synchronously
   * @param name - The name of the component
   * @param data - Component instance / data / async or sync function output to memoize
   * @param [options] - Component configuration
   * @see For setting component asynchronously, check {@link set set()}
   */
  setSync(
    name: string, data: object | (() => object), options: Partial<ComponentConfig> = {},
  ): void {
    this._container.memoSync(name, data, options);
  }

  /**
   * Registers a path alias.
   *
   * A path alias is a short name representing a long path (a file path, a URL, etc.)
   * @param alias - the alias name (e.g. "@framework"). It must start with a '@' character.
   * @param path - the path corresponding to the alias. If this is null, the alias will
   * be removed. Trailing '/' and '\' characters will be trimmed. This can be
   *
   * - a directory or a file path (e.g. `/tmp`, `/tmp/main.txt`)
   * - a URL (e.g. `https://www.google.com`)
   *
   * @param [fixSlashes=true] - Upon true, the trailing slash(es) (/) will be trimmed from path
   */
  setAlias(alias: string, path: string, fixSlashes: boolean = false): void {
    if (fixSlashes) {
      path = path.replace(/[\\/]+$/, '');
    }

    setAlias(alias, path);
  }

  /**
   * Translates a path alias into an actual path.
   *
   * The translation is done according to the following procedure:
   *
   * 1. If the given alias does not start with '@', it is returned back without change;
   * 2. Otherwise, look for the longest registered alias that matches the beginning part
   *    of the given alias. If it exists, replace the matching part of the given alias with
   *    the corresponding registered path.
   * 3. Throw an exception or return false, depending on the `throwException` parameter.
   *
   * For example, by default '@framework' is registered as the alias to the framework directory,
   * say '/path/to/yii'. The alias '@framework/utils/file' would then be translated into '/path/to/framework/utils/file'.
   *
   * Note, this method does not check if the returned path exists or not.
   * @param alias the alias to be translated.
   * @param throwException - Throw error when alias not found or alias is not registered.
   */
  getAlias(alias: string, throwException: boolean = true): string {
    return getAlias(alias, throwException);
  }

  /**
   * Check that given string contains a valid alias or not
   * @param alias - Alias or alias included path
   */
  hasAlias(alias: string): boolean {
    return hasAlias(alias);
  }

  /**
   * Sets the logger object.
   * @param logger the logger object.
   */
  setLogger(logger: Logger) {
    this.logger = logger;
  }

  /**
   * @return Logger message logger
   */
  getLogger() {
    return this.logger;
  }

  /**
   * Logs an error message.
   * An error message is typically logged when an unrecoverable error occurs
   * during the execution of an application.
   */
  error(msg: string, ...args: any[]) {
    this.logger.error(msg, ...args);
  }

  /**
   * Logs a debug message.
   * Trace messages are logged mainly for development purposes to see
   * the execution workflow of some code. This method will only log
   * a message when the application is in debug mode.
   */
  debug(msg: string, ...args: any[]) {
    this.logger.debug(msg, ...args);
  }

  /**
   * Logs a warning message.
   * A warning message is typically logged when an error occurs while the execution
   * can still continue.
   */
  warning(msg: string, ...args: any[]) {
    this.logger.warn(msg, ...args);
  }

  /**
   * Alias of {@link debug}.
   */
  trace(msg: string, ...args: any[]) {
    this.logger.trace(msg, ...args);
  }

  /**
   * Logs an informative message.
   * An informative message is typically logged by an application to keep record of
   * something important (e.g. an administrator logs in).
   */
  info(msg: string, ...args: any[]) {
    this.logger.info(msg, ...args);
  }

  /**
   * Creates a new object using the given configuration.<br>
   * This methods support input in a few different forms:
   *  1. As a string: It should start with @alias. e.g., `@app/classes/MyClass`
   *  2. As an object: Should be class object. e.g., `class Test {}`
   *  3. As configuration: Should be a plain object with alias or Class, for example:<br>
   * `{class: '@alias/path/Class', ...} // ... means class properties`<br>
   * `{class: ActionEvent, ...}`
   * <br>
   * @param type The class path | Class | configuration to create.
   * @param [params] A configuration array of constructor parameters.
   *
   * @example As an anonymous function with returning instance
   * const instance = Jii.createObject(params => {
   *   return new FileCache;
   * });
   *
   * @example As an anonymous function with returning class
   * const instance = Jii.createObject(() => {
   *   return FileCache;
   * });
   *
   * @example As a class object
   * class Test {
   *   constructor (params) {
   *     // some logic here
   *   }
   *
   *   init () {
   *     // some logic here
   *   }
   * }
   * const instance = Jii.createObject<Test>(Test, [
   *  {type: 'component'}, // value passes to Test constructor as a 'params' argument.
   * ]);
   *
   * @example As an alias file path
   * // create an object by loading a file and initiate with the two constructor parameters
   * const instance = Jii.createObject('@app/cache/FileCache', [param1, param2]);
   *
   * @example Configuration a class file path
   * const instance = Jii.createObject({
   *   class: '@jiiRoot/classes/Component',
   *   ...
   * });
   *
   * @example Configuration a Class object with properties
   * const instance = Jii.createObject({
   *   class: ActionEvent,
   *   action: 'create', // object properties (e.g. 'instance.action' returns 'create')
   *   'on eventName': ..., // events to bind with component
   *   'as behavior': ..., // behaviors to attach with component
   * });
   */
  public createObject<T = object>(type: ObjectType, params: any[] = []): T {
    return Instance.createFrom<T>(type, params);
  }
}
