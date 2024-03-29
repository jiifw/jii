/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// types
import {DeepPartial, Required} from 'utility-types';
import {FastifyFaviconOptions} from 'fastify-favicon';
import {FastifyCookieOptions} from '@fastify/cookie';
import {ServerHTTPOptions, ServerInstance} from '../server';
import {ComponentDefinition} from '@jii/core/dist/typings/components';
import {FastifyMultipartOptions} from '@fastify/multipart';
import {FastifySessionOptions} from '@fastify/session';


/**
 * Server configuration.
 */
export interface ServerComponentDefinition extends Omit<ComponentDefinition, 'class'> {
  /**
   * The server class.
   * @default "@jiiServer/classes/Server"
   */
  class?: string;

  /**
   * The address to bind server to.
   * @default 'localhost'
   */
  host?: string;

  /**
   * The port to start listen on
   * @default 8030
   */
  port?: number;

  /**
   * When true, the server will log all requests.
   * @default false
   */
  enableLogging?: boolean;

  /**
   * Cookies options,
   * @see https://github.com/fastify/fastify-cookie#options
   * @default {}
   */
  cookieOptions?: DeepPartial<FastifyCookieOptions>;

  /**
   * Favicon options,
   * @see https://github.com/smartiniOnGitHub/fastify-favicon#note
   * @default {}
   */
  faviconOptions?: DeepPartial<FastifyFaviconOptions>;

  /**
   * Multipart content-type options,
   * @see https://github.com/fastify/fastify-multipart?tab=readme-ov-file#usage
   * @default {}
   */
  multipartOptions?: DeepPartial<FastifyMultipartOptions>;

  /**
   * Session options, <br>
   * The session data is stored server-side using the configured session store.
   * @see https://github.com/fastify/session?tab=readme-ov-file#options
   * @default {}
   */
  sessionOptions?: DeepPartial<FastifySessionOptions>;

  /**
   * The options to pass to the server.
   * @see https://fastify.dev/docs/latest/Reference/Server/#factory
   */
  httpOptions?: ServerHTTPOptions;

  /**
   * When true routes are registered as case-sensitive. That is, `/foo` is not equal to `/Foo`. When `false` then routes are case-insensitive.
   *
   * <u>Please note</u> that setting this option to `false` goes against {@link https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.2.1 RFC3986}.
   * @default false
   */
  caseSensitive?: boolean;

  /**
   * Apply a middleware to the server instance
   *
   * @example
   * [
   *  { path: 'fastify-favicon', type: 'register' },
   *  { path: 'x-xss-protection', type: 'middleware' },
   *  {
   *    async handler(error: any) {
   *      if (error) throw error;
   *    },
   *    type: 'after',
   *  },
   *  {
   *    async handler(server: ServerInstance, options?: Record<string, any>) {
   *      // logic here
   *    },
   *    type: 'callback',
   *  },
   * ]
   */
  middleware?: MiddlewareDefinition[];
}

export type MiddlewareType = 'middleware' | 'callback' | 'after' | 'register';

type Middleware = {
  type: MiddlewareType;
  description?: string;
}

export type MiddlewareMiddleware<T> = Required<Middleware & {
  path: string;
  config?: T | Record<string, any>;
}, 'path' | 'type'>;

export type MiddlewareRegister<T> = Required<Middleware & {
  path: string;
  config?: T | Record<string, any>;
}, 'path' | 'type'>;

export type MiddlewareCallback<T> = Required<Middleware & {
  handler(server: ServerInstance): Promise<void>;
  handler(server: ServerInstance, config: Record<string, any>): Promise<void>;
  config?: T | Record<string, any>;
}, 'handler' | 'type'>;

export type MiddlewareAfter = Required<Middleware & {
  handler: (err: Error | null) => void;
}, 'handler' | 'type'>;

export type MiddlewareDefinition = (
  | {
  type: 'middleware'
  description?: string
  path: string
  config?: {
    [k: string]: unknown
  }
  [k: string]: unknown
}
  | {
  type: 'register'
  description?: string
  path: string
  config?: {
    [k: string]: unknown
  }
  [k: string]: unknown
}
  | {
  type: 'after'
  description?: string
  handler(error: any): Promise<void>;
  [k: string]: unknown
}
  | {
  type: 'callback';
  description?: string;
  handler(server?: ServerInstance, options?: Record<string, any>): Promise<void>;
  [k: string]: unknown;
}
  );

