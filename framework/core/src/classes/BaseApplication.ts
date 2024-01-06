/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Component from './Component';

// utils
import Jii from '../Jii';
import {CONTAINER_APP_KEY} from '../utils/symbols';

// scripts
import configValidator from '../scripts/config-validator';

// types
import {ApplicationConfig} from '../typings/app-config';
import {Props} from './BaseObject';

// public types
export type Params = Record<string, any>;

/**
 * Application class
 */
export default abstract class BaseApplication<
  T extends ApplicationConfig = ApplicationConfig
> extends Component {
  /**
   * Application unique identifier
   * @private
   */
  private _id: string;

  /**
   * Application base path
   * @private
   */
  private _basePath: string;

  /**
   * Application parameters
   * @private
   */
  private _params: Params;

  /**
   * Application constructor
   * @param config - Application configuration
   * @param [props] - Component properties
   */
  constructor(public readonly config: T, props: Props = {}) {
    super(props);
    this._initConfig();
    Jii.container.memoSync(CONTAINER_APP_KEY, this, {freeze: true});
  }

  /**
   * Initialize application configuration
   * @private
   */
  private _initConfig() {
    // validates/verify configuration
    configValidator(<ApplicationConfig>this.config);

    this._id = this.config.id;
    this._basePath = this.config.basePath;

    // set params
    this._params = this.config.params;

    // register aliases
    for (const key of Object.keys(this.config.aliases)) {
      this.config.params[key] = this.config.aliases[key];
      Jii.setAlias(key, this.config.aliases[key]);
    }
  }

  /**
   * Get application parameters
   */
  get params(): Params {
    return this._params;
  }

  /**
   * Get application base path
   */
  get basePath(): string {
    return this._basePath;
  }
}
