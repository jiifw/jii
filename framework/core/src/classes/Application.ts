/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Event from './Event';
import Plugin from './Plugin';
import Module from './Module';
import Action from './Action';
import Controller from './Controller';
import PluginAppEvent from './PluginAppEvent';
import InvalidConfigError from './InvalidConfigError';

// scripts
import applyAppCoreConfiguration from '../scripts/app-core-configuration';

// utils
import Jii from '../Jii';
import {APP_CONFIG, CONTAINER_APP_KEY} from '../utils/symbols';

// types
import {Props} from './BaseObject';
import {ApplicationConfig, ComponentsDefinition} from '../typings/app-config';
import Response from './Response';
import Request from './Request';
import {getValue} from '../env';
import {isTimezone} from '../helpers/datetime';
import InvalidArgumentError from './InvalidArgumentError';

// public types
export type Platform = 'web' | 'cli' | string;

/**
 * Application is the base class for all application classes.
 */
export default abstract class Application<
  T extends ApplicationConfig = ApplicationConfig
> extends Module {
  // allow props
  [property: string | symbol]: any;

  /**
   * An event raised when the configuration is being finalized.
   * @event ConfigurationEvent
   */
  public static readonly EVENT_BEFORE_FINALIZE_CONFIG: string = 'beforeFinalizeConfig';

  /**
   * Application state used by {@link state} application just started.
   */
  public static readonly STATE_BEGIN: number = 0;

  /**
   * Application state used by {@link state} application is initializing.
   */
  public static readonly STATE_INIT: number = 1;

  /**
   * The current application state during a request handling life cycle.<br>
   * This property is managed by the application. Do not modify this property.
   */
  public state: number;

  /**
   * The application name.
   */
  public name: string = 'My Application';

  /**
   * The time zone used by this application.
   */
  public timeZone: string = 'UTC';

  /**
   * The language that is meant to be used for end users. It is recommended that you
   * use [IETF language tags](http://en.wikipedia.org/wiki/IETF_language_tag). For example, `en` stands
   * for English, while `en-US` stands for English (United States).
   * @see sourceLanguage
   */

  public language: string = 'en-US';

  /**
   * The language that the application is written in. This mainly refers to<br>
   * the language that the messages and view files are written in.
   * @see language
   */
  public sourceLanguage: string = 'en-US';

  /**
   * The currently active controller instance
   */
  public controller: Controller;

  /**
   * The layout that should be applied for views in this application. Defaults to 'main'.
   * If this is false, layout will be disabled.
   */
  public layout: string | false = 'main';

  /**
   * The requested route
   */
  public requestedRoute: string = null;

  /**
   * The requested Action. If null, it means the request cannot be resolved into an action.
   */
  public requestedAction: Action | null = null;

  /**
   * The parameters supplied to the requested action.
   */
  public requestedParams: any[] = [];

  /**
   * List of loaded modules indexed by their class names.
   */
  public loadedModules: Map<string, Module> = new Map();

  /**
   * Application type
   * @protected
   */
  protected _platform: Platform = null;

  /**
   * Application configuration
   * @protected
   */
  private _appConfig: T = null;

  /**
   * Get application type (a web platform or command line interface)
   */
  get platform(): Platform {
    return this._platform;
  }

  /**
   * Application constructor
   * @param config - Application configuration
   * @param [props] - Component properties
   */
  constructor(config: T, props: Props = {}) {
    super(null, null, props);
    this._appConfig = config;
    Jii.container.memoSync(CONTAINER_APP_KEY, this, {freeze: true});
    this.state = Application.STATE_BEGIN;
    this.init();
  }

  /**
   * Initializes the application.
   *
   * This method is called after the module is created and initialized with property values
   * given in configuration.
   *
   * If you override this method, please make sure you call the parent implementation.
   */
  init() {
    super.init();
    this.state = Application.STATE_INIT;
  }

  /**
   * @inheritDoc
   */
  getUniqueId(): string {
    return '';
  }

  /**
   * Sets the root directory of the application and the `@app` alias.<br>
   * This method can only be invoked at the beginning of the constructor.
   * @param path the root directory of the application.
   * @throws {InvalidArgumentError} If the directory does not exist.
   */
  public setBasePath(path: string) {
    super.setBasePath(path);
    Jii.setAlias('@app', this.getBasePath());
  }

  /**
   * Pre-initializes the application configuration<br>
   * This method is called at the beginning of the application constructor.<br>
   * It initializes several important application properties.<br>
   * If you override this method, please make sure you call the parent implementation.<br>
   * @param config - The application configuration
   */
  public preInitConfig(config: ApplicationConfig): void {
  }

  /**
   * Pre-initializes the application.<br>
   * This method is called at the beginning of the application constructor.<br>
   * It initializes several important application properties.<br>
   * <b style="color:red">Warning</b>: If you override this method, please make sure you call the parent implementation.<br>
   * @param config - The application configuration
   * @throws InvalidConfigError if either {@link id} or {@link basePath} configuration is missing.
   */
  public async preInit(config: T): Promise<void> {
    if (!this._platform) {
      throw new InvalidConfigError('You must specify the application type');
    }

    const _config = await applyAppCoreConfiguration(this, config);

    // memorize the configuration for future reference and usage
    Jii.container.memoSync(APP_CONFIG, _config, {freeze: true});

    // flush tmp configuration
    this._appConfig = null;
  }

  /**
   * Returns the predefined configuration of application components.
   * @see {@link setComponents setComponents()}
   *
   * @example
   * coreComponents() {
   *   return {
   *     server: { class: '@jiiRoot/classes/Component' },
   *     ...,
   *   }
   * }
   */
  public coreComponents(): ComponentsDefinition {
    return {};
  }

  /**
   * Returns configuration validators *(aliased paths)*
   * @example
   * [
   *   '@jiiRoot/config/validators/CoreConfigValidator',
   *   ...,
   * ]
   */
  public coreConfigValidators(): string[] {
    return [];
  }

  /**
   * Run the application<br>
   * If you override this method, please make sure you call the parent implementation.
   */
  public async run(): Promise<void> {
    // initialize configuration
    await this.preInit(this._appConfig);

    /////////////// STARTS: PLUGIN EVENT (BEFORE_APP_RUN) TRIGGER //////////////
    let pluginEvent = new PluginAppEvent();
    pluginEvent.sender = this;
    for (const handler of Object.values(Jii.plugins.getPluginsEvent(Plugin.EVENT_BEFORE_APP_RUN))) {
      await Event.triggerHandler(Plugin.EVENT_BEFORE_APP_RUN, handler, {}, pluginEvent);
    }
    pluginEvent = null;
    /////////////// ENDS: PLUGIN EVENT (BEFORE_APP_RUN) TRIGGER ////////////////
  }

  /**
   * Handles the specified request.
   *
   * This method should return an instance of {@link Response} or its child class<br>
   * which represents the handling result of the request.
   *
   * @param request - The request to be handled
   * @return The resulting response
   */
  public abstract handleRequest<T, R>(request: T): Promise<T>;

  /**
   * Returns the time zone used by this application.<br>
   * it will be set to UTC by default.
   * @returns The time zone used by this application.
   */
  public getTimeZone(): string {
    const _val = getValue<string | null>('TZ', null);

    if (!_val) {
      this.setTimeZone('UTC');
    }

    return _val;
  }

  /**
   * Sets the time zone used by this application.<br>
   * @param value the time zone used by this application.
   */
  public setTimeZone(value: string) {
    if (!isTimezone(value)) {
      throw new InvalidArgumentError(`Invalid time zone: ${value}`);
    }
    process.env.TZ = value;
  }
}
