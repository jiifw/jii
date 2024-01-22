/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import BaseRequest from '@jii/core/dist/classes/Request';
import RequestHeaderCollection from './RequestHeaderCollection';

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
   * The headers collection
   */
  private _headers: RequestHeaderCollection;

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

  /**
   * Returns the header collection.
   * The header collection contains the currently registered HTTP headers.
   * @returns The header collection
   */
  public getHeaders(): RequestHeaderCollection {
    if (!this._headers) {
      this._headers = new RequestHeaderCollection(this.getRequest());
    }
    return this._headers;
  }

  /**
   * Returns the method of the current request (e.g. GET, POST, HEAD, PUT, PATCH, DELETE).
   * @return Request method, such as GET, POST, HEAD, PUT, PATCH, DELETE.
   * The value returned is turned into upper case.
   */
  public getMethod(): string {
    return this.getRequest().method;
  }

  /**
   * Returns whether this is a GET request.
   * @return bool whether this is a GET request.
   */
  public getIsGet(): boolean {
    return this.getMethod() === 'GET';
  }

  /**
   * Returns whether this is an OPTIONS request.
   * @return bool whether this is a OPTIONS request.
   */
  public getIsOptions(): boolean {
    return this.getMethod() === 'OPTIONS';
  }

  /**
   * Returns whether this is a HEAD request.
   * @return Whether this is a HEAD request.
   */
  public getIsHead(): boolean {
    return this.getMethod() === 'HEAD';
  }

  /**
   * Returns whether this is a POST request.
   * @return bool whether this is a POST request.
   */
  public getIsPost(): boolean {
    return this.getMethod() === 'POST';
  }

  /**
   * Returns whether this is a DELETE request.
   * @return bool whether this is a DELETE request.
   */
  public getIsDelete(): boolean {
    return this.getMethod() === 'DELETE';
  }

  /**
   * Returns whether this is a PUT request.
   * @return bool whether this is a PUT request.
   */
  public getIsPut(): boolean {
    return this.getMethod() === 'PUT';
  }

  /**
   * Returns whether this is a PATCH request.
   * @return bool whether this is a PATCH request.
   */
  public getIsPatch(): boolean {
    return this.getMethod() === 'PATCH';
  }

  /**
   * Returns whether this is an AJAX (XMLHttpRequest) request.
   *
   * Note that in case of cross domain requests, browser doesn't set the X-Requested-With header by default:
   * https://stackoverflow.com/questions/8163703/cross-domain-ajax-doesnt-send-x-requested-with-header
   *
   * In case you are using `fetch()`, pass header manually:
   *
   * ```
   * fetch(url, {
   *    method: 'GET',
   *    headers: {'X-Requested-With': 'XMLHttpRequest'}
   * })
   * ```
   *
   * @returns Whether this is an AJAX (XMLHttpRequest) request.
   */
  public getIsAjax(): boolean {
    return this.getHeaders().get('X-Requested-With') === 'XMLHttpRequest';
  }
}
