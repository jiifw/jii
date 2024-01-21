/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import BaseObject, {Props} from '@jii/core/dist/classes/BaseObject';
import {HttpHeader} from 'fastify/types/utils';
import {WebResponse} from './Response';

type HeaderName = HttpHeader | string;
type HeaderValue = number | string | undefined;

/**
 * HeaderCollection is used by {@link Response} to maintain the currently registered HTTP headers.
 */
export default class HeaderCollection extends BaseObject {
  /**
   * The HTTP response object
   */
  private _response: WebResponse;

  /**
   * @inheritDoc
   */
  public constructor(response: WebResponse, props: Props = {}) {
    super(props);
    this._response = response;
  }

  /**
   * Get response instance
   */
  protected getResponse(): WebResponse {
    return this._response;
  }

  /**
   * Returns the number of headers in the collection.
   * @returns The number of headers in the collection.
   */
  public getCount(): number {
    return Object.keys(this.getResponse().getHeaders()).length;
  }

  /**
   * Returns the named header(s).
   * @param name - The name of the header to return
   * @param defaultValue - The value to return in case the named header does not exist
   * @return The named header(s)
   */
  public get(name: HeaderName | string, defaultValue: any = null): HeaderValue | HeaderValue[] | null {
    return this.getResponse().getHeader(name.toLowerCase()) ?? defaultValue;
  }

  /**
   * Adds a new header.
   * If there is already a header with the same name, it will be replaced.
   * @param name - The name of the header
   * @param value - The value of the header
   * @return The collection object itself
   */
  public set(name: HeaderName, value: HeaderValue = '') {
    this.getResponse().header(name.toLowerCase(), value);
    return this;
  }

  /**
   * Returns a value indicating whether the named header exists.
   * @param name - The name of the header
   * @return Whether the named header exists
   */
  public has(name: HeaderName): boolean {
    return this.getResponse().hasHeader(name.toLowerCase());
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
      this.getResponse().removeHeader(normalizedName);
      return value;
    }

    return null;
  }

  /**
   * Populates the header collection from an object.
   * @param obj - The headers to populate from
   */
  public fromObject(obj: Record<string, HeaderValue>): void {
    this.getResponse().headers(obj);
  }
}
