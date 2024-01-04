/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {Required} from 'utility-types';

// types
import {ServerInstance} from '../typings/server';
import {Middleware as MiddlewarePath} from '../typings/middleware';

export type MiddlewareType = 'middleware' | 'plugin' | 'callback' | 'after' | 'register';

type Middleware = {
  type: MiddlewareType;
  description?: string;
}

export type MiddlewarePlugin<T> = Required<Middleware & {
  path: MiddlewarePath;
  config?: T | Record<string, any>;
}, 'path' | 'type'>;

export type MiddlewareMiddleware<T> = Required<Middleware & {
  path: MiddlewarePath;
  config?: T | Record<string, any>;
}, 'path' | 'type'>;

export type MiddlewareRegister<T> = Required<Middleware & {
  path: MiddlewarePath;
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

export type MiddlewareArgs = (
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
  type: 'plugin'
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
  handler: {}
  [k: string]: unknown
}
  | {
  type: 'plugin'
  description?: string
  config?: {
    [k: string]: unknown
  }
  [k: string]: unknown
}
  )[];

export type Registry<T> = MiddlewareArgs;
