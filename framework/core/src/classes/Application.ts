/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Module from './Module';
import ConfigurationEvent from './ConfigurationEvent';
import InvalidConfigError from './InvalidConfigError';

// utils
import Jii from '../Jii';
import {APP_CONFIG, CONTAINER_APP_KEY} from '../utils/symbols';

// scripts
import configurationProcessor from '../scripts/configuration-processor';

// types
import {Props} from './BaseObject';
import {ApplicationConfig, ComponentsDefinition} from '../typings/app-config';

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
   * The language that the application is written in. This mainly refers to
   * the language that the messages and view files are written in.
   * @see language
   */
  public sourceLanguage: string = 'en-US';

  /**
   * Application type
   * @protected
   */
  protected _platform: 'web' | 'cli' | string = null;

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
    this.state = Application.STATE_INIT;
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

    this.preInitConfig(config);

    const validators = [
      '@jiiRoot/config/validators/CoreConfigValidator',
      '@jiiRoot/config/validators/SettingsConfigValidator',
      '@jiiRoot/config/validators/AppEventsConfigValidator',
      '@jiiRoot/config/validators/PluginsConfigValidator',
      '@jiiRoot/config/validators/ComponentsConfigValidator',
      ...this.coreConfigValidators(),
    ];

    // validates, verify and apply the configuration
    const updatedConfig = await configurationProcessor({
      app: this, config, validators,
    });

    const event = new ConfigurationEvent();
    event.sender = this;
    event.config = updatedConfig as ApplicationConfig;

    await this.trigger(Application.EVENT_BEFORE_FINALIZE_CONFIG, event);

    // memorize the configuration for future reference and usage
    Jii.container.memoSync(APP_CONFIG, event.config, {freeze: true});
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
  }
}
