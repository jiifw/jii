/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import BaseRequest from '@jii/core/dist/classes/Request';

// utils
import Jii from '@jii/core/dist/Jii';
import {SERVER_REQUEST} from '../utils/symbols';

// types
import {IncomingMessage} from 'http';
import {ServerRequest} from '../typings/server';

/**
 * The web Request class represents an HTTP request.
 *
 * Request is configured as an application component in {@link Application} by default.<br>
 * You can access that instance via `Jii.app().get<Request>('request')`.
 */
export default class Request extends BaseRequest {
  /**
   * Get raw request instance
   */
  public getRequest<T extends ServerRequest = ServerRequest>(): T {
    return Jii.container.retrieve<T>(SERVER_REQUEST);
  }

  /**
   * Get nodejs raw request instance
   */
  public getRaw(): IncomingMessage {
    return this.getRequest().raw as unknown as IncomingMessage;
  }
}
