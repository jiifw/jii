/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import {resolve} from './helpers/path';
import {isClass} from './helpers/reflection';
import {getAlias, setAlias} from './base/aliases';

// classes
import Logger from './logger/Logger';
import Container from './classes/Container';
import MiddlewareContainer from './classes/MiddlewareContainer';
import Application from '@jii/server/dist/base/Application';

// types
import {Class} from 'utility-types';
import {ServerInstance} from '@jii/server/dist/typings/server';
import {ComponentConfig} from './classes/Container';

export const CONTAINER_MIDDLEWARE_KEY = Symbol.for('__middleware');
export const CONTAINER_APP_KEY = Symbol.for('__app');

// public types
export type AppInstance = InstanceType<typeof Application<ServerInstance>>;
export type MiddlewareRegistry = InstanceType<typeof MiddlewareContainer>;

export default abstract class BaseJii {
  protected _container: Container;
  protected logger: Logger;

  /**
   * A constructor for the Jii class.
   */
  constructor() {
    this._container = new Container();
    this.logger = new Logger();
    this._container.memoSync(CONTAINER_MIDDLEWARE_KEY, new MiddlewareContainer(), {
      freeze: true,
    });
  }

  /**
   * Get application instance
   */
  app<T extends AppInstance = AppInstance>(): T {
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
  get middleware(): InstanceType<typeof MiddlewareContainer> {
    return this._container.retrieve(CONTAINER_MIDDLEWARE_KEY);
  }

  /**
   * Returns component from container object
   * @param name - The name of the component
   * @returns Component instance
   */
  get<T>(name: string): T {
    if (!this._container.exists(name)) {
      throw new Error(`Component ${name} not found in container`);
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
   * Creates a new object using the given configuration.
   *
   * @param classname The class name to create. Must start with @alias. e.g., @alias/path/to/class
   * @param [params] A configuration array of constructor parameters.
   *
   * @example
   *
   * // create an object with two constructor parameters
   * const object = Jii.createObject('@app/classes/MyClass', [param1, param2]);
   */

  createObject<T extends object>(classname: string, params: any[] = []): InstanceType<Class<T>> {
    if (!classname.startsWith('@')) {
      throw new Error('Classname must start with @alias. e.g., @alias/path/to/class');
    }

    const Class = require(resolve(classname))?.default || null;

    if (!Class || !isClass(Class)) {
      throw new Error('File must have an actual class and should be exported as default');
    }

    const instance = new Class(...params);

    if ('init' in instance && 'function' === typeof instance.init) {
      instance.init.call(null);
    }

    return instance;
  }
}
