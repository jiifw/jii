/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import merge from 'deepmerge';

// classes
import Request from './Request';
import Component from '@jii/core/dist/classes/Component';

// utils
import Jii from '@jii/core/dist/Jii';

// types
import {DeepPartial} from 'utility-types';
import {ServerRequest} from '../typings/server';
import {TokenAllOption, TokenBearerOption, TokenHeaderOption, TokenOption} from '../typings/classes/AccessToken';

const CONTENT_TYPE_FORM_URLENCODED: string = 'application/x-www-form-urlencoded';
const CONTENT_TYPE_FORM_MULTIPART: string = 'multipart/form-data';

/**
 * Access token component to retrieve access-token from an incoming request
 */
export default class AccessToken extends Component {
  /** Token field name */
  public field: string = 'access_token';

  /** Token header name */
  public headerName: string = 'x-access-token';

  /** Token authorization 'schema' name */
  public scheme: string = 'Bearer';

  /**
   * Get fastify request instance
   * @protected
   */
  protected getRequest(): ServerRequest {
    return Jii.app().get<Request>('request').getRequest();
  }

  /**
   * Retrieve access token from a URL query param
   * @param [options] - Additional options
   */
  public query(options?: TokenOption): string | null {
    options = merge({name: this.field}, options || {});
    return (<string>this.getRequest().query?.[options.name])?.trim() || null;
  };

  /**
   * Retrieve access token from a FormBody object
   * @param [options] - Additional options
   */
  public formBody(options?: TokenOption): string | null {
    options = merge({name: this.field}, options || {});
    const contentType: string = this.getRequest().headers['content-type'] || '';

    if (contentType.startsWith(CONTENT_TYPE_FORM_URLENCODED)
      || contentType.startsWith(CONTENT_TYPE_FORM_MULTIPART)) {
      return String(this.getRequest().body?.[options.name] || '')?.trim() || null;
    }

    return null;
  };

  /**
   * Retrieve access token from a request body
   * @param [options] - Additional options
   */
  public body(options?: TokenOption): string | null {
    options = merge({name: this.field}, options || {});
    return String(this.getRequest().body?.[options.name] || '')?.trim() || null;
  };

  /**
   * Retrieve access token from an Auth bearer header
   * @param [options] - Additional options
   */
  public authBearer(options?: TokenBearerOption): string | null {
    options = merge({scheme: this.scheme}, options || {});
    if (!this.getRequest().headers.hasOwnProperty('authorization')) {
      return null;
    }

    const [
      scheme = null, token = null,
    ] = this.getRequest().headers?.authorization?.trim().split(' ');

    return !scheme || scheme.toLowerCase() !== options?.scheme?.toLowerCase()
      ? null
      : token;
  };

  /**
   * Retrieve access token from a header
   * @param [options] - Additional options
   */
  public header(options: DeepPartial<TokenHeaderOption> = {}): string | null {
    options = merge({header: this.headerName}, options || {});
    return (<string>this.getRequest().headers?.[options.header])?.trim() || null;
  };

  /**
   * Retrieve access token from all sources
   * @see {@link query AccessToken.query()}
   * @see {@link body AccessToken.body()}
   * @see {@link formBody AccessToken.formBody()}
   * @see {@link authBearer AccessToken.authBearer()}
   * @see {@link header AccessToken.header()}
   * @param [options] - Additional options
   */
  public retrieve(options: DeepPartial<TokenAllOption> = {}): string | null {
    for (const retriever of [this.query, this.body, this.header, this.authBearer, this.formBody]) {
      const token = retriever(options as any);
      if (token) {
        return <string>token;
      }
    }

    return null;
  };
}
