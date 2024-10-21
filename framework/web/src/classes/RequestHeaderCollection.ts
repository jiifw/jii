/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import BaseObject, {Props} from '@jii/core/dist/classes/BaseObject';
import {HttpHeader} from 'fastify/types/utils';
import {ServerRequest} from '~/typings/server';

type HeaderName = HttpHeader | string;
type HeaderValue = number | string | undefined;

/**
 * RequestHeaderCollection is used by {@link Request} to maintain the currently registered HTTP headers.
 */
export default class RequestHeaderCollection extends BaseObject {
  /**
   * The HTTP request object
   */
  private _request: ServerRequest;

  /**
   * The headers collection object
   */
  private _headers: Map<HeaderName, HeaderValue> = new Map();

  /**
   * @inheritDoc
   */
  public constructor(request: ServerRequest, props: Props = {}) {
    super(props);
    this._request = request;
    this.fromObject(this._request.headers as any);
  }

  /**
   * Returns the number of headers in the collection.
   * @returns The number of headers in the collection.
   */
  public getCount(): number {
    return this._headers.size;
  }

  /**
   * Returns all headers in the collection.
   * @returns The headers collection.
   */
  public getAll(): { [name: HeaderName]: HeaderValue } {
    return Object.fromEntries(this._headers.entries());
  }

  /**
   * Returns the named header(s).
   * @param name - The name of the header to return
   * @param [defaultValue] - The value to return in case the named header does not exist
   * @returns The named header(s)
   */
  public get(name: HeaderName | string, defaultValue: any = null): HeaderValue | HeaderValue[] | null {
    return !this.has(name.toLowerCase())
      ? defaultValue
      : this._headers.get(name.toLowerCase());
  }

  /**
   * Adds a new header.
   * If there is already a header with the same name, it will be replaced.
   * @param name - The name of the header
   * @param value - The value of the header
   * @return The collection object itself
   */
  public set(name: HeaderName, value: HeaderValue = '') {
    this._headers.set(name.toLowerCase(), value);
    this._request.headers[name.toLowerCase()] = value as any;
    return this;
  }

  /**
   * Returns a value indicating whether the named header exists.
   * @param name - The name of the header
   * @return Whether the named header exists
   */
  public has(name: HeaderName): boolean {
    return this._headers.has(name.toLowerCase());
  }

  /**
   * Removes a header.
   * @param name - The name of the header to be removed.
   * @returns The value of the removed header. Null is returned if the header does not exist.
   */
  public remove(name: HeaderName): HeaderValue | HeaderValue[] | null {
    const normalizedName = name.toLowerCase();
    if (this.has(normalizedName)) {
      const value = this.get(normalizedName);
      this._headers.delete(normalizedName);
      return value;
    }

    return null;
  }

  /**
   * Populates the header collection from an object.
   * @param obj - The headers to populate from
   */
  public fromObject(obj: Record<string, HeaderValue>): void {
    for (const [name, value] of Object.entries(obj)) {
      this._headers.set(name, value);
    }
  }
}
