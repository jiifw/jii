/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import BaseApplicationCore from '@jii/core/dist/classes/BaseApplication';

// utils
import Jii from '@jii/core/dist/Jii';

// types
import {ApplicationConfig} from '../typings/app-config';

// public types
export type Application = InstanceType<typeof BaseApplication>;

/**
 * Application class
 */
export default abstract class BaseApplication<Server, Request, Reply>
  extends BaseApplicationCore<ApplicationConfig> {
  /**
   * Server instance
   * @protected
   */
  protected _server: Server;

  /**
   * Get application server instance
   */
  get server(): Server {
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
