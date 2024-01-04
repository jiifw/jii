/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Component from '@jii/core/dist/classes/Component';

// utils
import Jii from '@jii/core/dist/Jii';
import {bindClass} from '@jii/core/dist/helpers/auto-bind';

// types
import {ApplicationConfig} from '../typings/app';
import {ServerInstance, ServerRequest, ServerReply} from '@jii/server/dist/typings/server';

// scripts
import configValidator from '../scripts/config-validator';

export type Params = Record<string, any>;

/**
 * Application class
 */
export default abstract class Application<
  S extends ServerInstance = ServerInstance,
  Request extends ServerRequest = ServerRequest,
  Reply extends ServerReply = ServerReply
> extends Component {
  private _id: string;
  private _basePath: string;
  private _params: Params;
  protected _server: S;

  /**
   * Application constructor
   * @param config - Application configuration
   */
  constructor(
    public readonly config: Partial<ApplicationConfig>,
  ) {
    super({});

    bindClass(this);
    this._initConfig();
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

  /**
   * Get application server instance
   */
  get server(): S {
    return this._server;
  }

  /**
   * Get the request object
   */
  get request(): Request {
    return Jii.get('request');
  }

  /**
   * Get the response object
   */
  get response(): Reply {
    return Jii.get('response');
  }
}
