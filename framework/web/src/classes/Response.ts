/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Server from './Server';
import Event from '@jii/core/dist/classes/Event';
import BaseResponse from '@jii/core/dist/classes/Response';
import InvalidArgumentError from '@jii/core/dist/classes/InvalidArgumentError';

// utils
import Jii from '@jii/core/dist/Jii';
import {SERVER_REPLY} from '~/utils/symbols';

// types
import {IncomingMessage} from 'http';
import {ServerReply} from '~/typings/server';
import HeaderCollection from './HeaderCollection';

// public types
export type WebResponse = ServerReply;

/**
 * The web Response class represents an HTTP response.
 *
 * It holds the {@link headers} {@link cookies} and {@link content} that is to be sent to the client.<br>
 * It also controls the HTTP {@link statusCode status code}.
 *
 * Response is configured as an application component in {@link Application} by default.<br>
 * You can access that instance via `Jii.app().get<Response>('response')`.
 */
export default class Response extends BaseResponse {
  /**
   * An event that is triggered at the beginning of send response.
   */
  public static readonly EVENT_BEFORE_SEND: string = 'beforeSend';

  /**
   * An event that is triggered at the end of send response.
   */
  public static readonly EVENT_AFTER_SEND: string = 'afterSend';

  /**
   * The headers collection
   */
  private _headers: HeaderCollection;

  init() {
    super.init();
    Jii.app().get<Server>('server').getServer()
      .addHook('onSend', async (request, reply, payload) => {
        const event = new Event();
        event.data = payload;
        await this.trigger(Response.EVENT_BEFORE_SEND, event);
        return event.data;
      })
      .addHook('onResponse', async () => {
        await this.trigger(Response.EVENT_AFTER_SEND);
      });
  }

  /**
   * Get raw response instance
   */
  public getResponse<T extends WebResponse = WebResponse>(): T {
    return Jii.container.retrieve<T>(SERVER_REPLY);
  }

  /**
   * Get nodejs raw response instance
   */
  public getRaw(): IncomingMessage {
    return this.getResponse().raw as unknown as IncomingMessage;
  }

  /**
   * @return The HTTP status code to send with the response.
   */
  public getStatusCode(): number {
    return this.getResponse().statusCode;
  }

  /**
   * Sets the response status code.
   * @param value - The status code
   * @throws {InvalidArgumentError} if the status code is invalid.
   * @return The response object itself
   */
  public setStatusCode(value: number): this {
    if (value === null) {
      value = 200;
    }

    this.getResponse().code(Number(value));
    if (this.getIsInvalid()) {
      throw new InvalidArgumentError(`The HTTP status code is invalid: ${value}`);
    }

    return this;
  }

  /**
   * @return Whether this response has a valid {@link statusCode}.
   */
  public getIsInvalid(): boolean {
    return this.getStatusCode() < 100 || this.getStatusCode() >= 600;
  }

  /**
   * @return Whether this response is informational
   */
  public getIsInformational(): boolean {
    return this.getStatusCode() >= 100 && this.getStatusCode() < 200;
  }


  /**
   * @return Whether this response is successful
   */
  public getIsSuccessful(): boolean {
    return this.getStatusCode() >= 200 && this.getStatusCode() < 300;
  }

  /**
   * @return Whether this response is a redirection
   */
  public getIsRedirection(): boolean {
    return this.getStatusCode() >= 300 && this.getStatusCode() < 400;
  }

  /**
   * @return Whether this response indicates a client error
   */
  public getIsClientError(): boolean {
    return this.getStatusCode() >= 400 && this.getStatusCode() < 500;
  }

  /**
   * @return Whether this response indicates a server error
   */
  public getIsServerError(): boolean {
    return this.getStatusCode() >= 500 && this.getStatusCode() < 600;
  }

  /**
   * @return Whether this response is OK
   */
  public getIsOk(): boolean {
    return this.getStatusCode() == 200;
  }

  /**
   * @return Whether this response indicates the current request is forbidden
   */
  public getIsForbidden(): boolean {
    return this.getStatusCode() == 403;
  }

  /**
   * @return Whether this response indicates the currently requested resource is not found
   */
  public getIsNotFound(): boolean {
    return this.getStatusCode() == 404;
  }

  /**
   * @return Whether this response is empty
   */
  public getIsEmpty(): boolean {
    return [201, 204, 304].includes(this.getStatusCode());
  }

  /**
   * Returns the header collection.
   * The header collection contains the currently registered HTTP headers.
   * @returns The header collection
   */
  public getHeaders(): HeaderCollection {
    if (!this._headers) {
      this._headers = new HeaderCollection(this.getResponse());
    }
    return this._headers;
  }
}
