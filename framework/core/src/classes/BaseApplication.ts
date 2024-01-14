/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import {Module} from './Module';

// utils
import Jii from '../Jii';
import {APP_CONFIG, CONTAINER_APP_KEY} from '../utils/symbols';

// scripts
import configValidator from '../scripts/config-validator';

// types
import {ApplicationConfig} from '../typings/app-config';
import {Props} from './BaseObject';

/**
 * Application is the base class for all application classes.
 */
export default abstract class BaseApplication<
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
   * Application constructor
   * @param config - Application configuration
   * @param [props] - Component properties
   */
  constructor(config: T, props: Props = {}) {
    super(null, null, props);
    Jii.container.memoSync(CONTAINER_APP_KEY, this, {freeze: true});
    this.state = BaseApplication.STATE_BEGIN;

    this.preInit(config);
  }

  /**
   * Pre-initializes the application.<br>
   * This method is called at the beginning of the application constructor.<br>
   * It initializes several important application properties.<br>
   * If you override this method, please make sure you call the parent implementation.<br>
   * @param config - The application configuration
   * @throws InvalidConfigError if either {@link id} or {@link basePath} configuration is missing.
   */
  public preInit(config: T) {
    // validates/verify configuration
    configValidator(<ApplicationConfig>config);

    this.id = config.id;
    this.params = config.params;
    this.setBasePath(config.basePath);

    // register aliases
    for (const key of Object.keys(config.aliases)) {
      Jii.setAlias(key, config.aliases[key]);
    }

    this.setComponents(config?.components)

    Jii.container.memoSync(APP_CONFIG, config, {freeze: true});
  }
}
