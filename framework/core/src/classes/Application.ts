/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import objPath from 'object-path';

// classes
import Module from './Module';

// utils
import Jii from '../Jii';
import {toString} from '../helpers/string';
import {isPlainObject} from '../helpers/object';
import {APP_CONFIG, CONTAINER_APP_KEY} from '../utils/symbols';

// scripts
import configValidator from '../scripts/config-validator';

// types
import {Props} from './BaseObject';
import InvalidConfigError from './InvalidConfigError';
import {ApplicationConfig, ComponentsDefinition} from '../typings/app-config';

/**
 * Application is the base class for all application classes.
 */
export default abstract class Application<
  T extends ApplicationConfig = ApplicationConfig
> extends Module {

  // allow props
  [property: string | symbol]: any;

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
   * Application constructor
   * @param config - Application configuration
   * @param [props] - Component properties
   */
  constructor(config: T, props: Props = {}) {
    super(null, null, props);
    Jii.container.memoSync(CONTAINER_APP_KEY, this, {freeze: true});
    this.state = Application.STATE_BEGIN;

    this.preInit(config);
  }

  /**
   * Pre-initializes the application configuration<br>
   * This method is called at the beginning of the application constructor.<br>
   * It initializes several important application properties.<br>
   * If you override this method, please make sure you call the parent implementation.<br>
   * @param config - The application configuration
   */
  public preInitConfig(config: ApplicationConfig): void {
    if (!objPath.has(config, 'components') || !isPlainObject(config.components)) {
      config.components = {};
    }

    // merge core components with custom components
    for (const [id, component] of Object.entries(this.coreComponents())) {
      if (!objPath.has(config, ['components', id])) {
        config['components'][id] = component;
      } else if (isPlainObject(config.components[id])
        && !objPath.has(config, ['components', id, 'class'])) {
        objPath.set(config, ['components', id, 'class'], component['class']);
      }
    }
  }

  /**
   * Pre-initializes the application.<br>
   * This method is called at the beginning of the application constructor.<br>
   * It initializes several important application properties.<br>
   * If you override this method, please make sure you call the parent implementation.<br>
   * @param config - The application configuration
   * @throws InvalidConfigError if either {@link id} or {@link basePath} configuration is missing.
   */
  public preInit(config: T): void {
    this.preInitConfig(config);

    // validates/verify configuration
    configValidator(<ApplicationConfig>config);

    if (!toString(config?.id, true)) {
      throw new InvalidConfigError('The "id" configuration for the Application is required.');
    }

    // memorize the configuration for future reference and usage
    Jii.container.memoSync(APP_CONFIG, config, {freeze: true});

    this.id = config.id;
    delete config.id;

    if (toString(config?.name, true)) {
      this.name = config.name;
      delete config.name;
    }

    if (toString(config?.language, true)) {
      this.language = config.language;
      delete config.language;
    }

    if (toString(config?.sourceLanguage, true)) {
      this.sourceLanguage = config.sourceLanguage;
      delete config.sourceLanguage;
    }

    if (toString(config?.timeZone, true)) {
      this.timeZone = config.timeZone;
      delete config.timeZone;
    }

    if (isPlainObject(config?.params)) {
      this.params = config.params;
      delete config.params;
    }

    this.setBasePath(config.basePath);

    // register aliases
    this.setAliases(config.aliases);

    this.setComponents(config?.components);
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
   * Returns the configuration of core application components.
   * @see set()
   */
  public coreComponents(): ComponentsDefinition {
    return {};
  }
}
