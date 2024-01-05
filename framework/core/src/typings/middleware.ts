/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

export type MiddlewareType = 'middleware' | 'plugin' | 'callback' | 'after' | 'register';

interface Config {
  [k: string]: unknown;
}

interface Middleware {
  description?: string;
  [k: string]: unknown;
}

export interface MiddlewareMiddleware<T = Config> extends Middleware {
  type: 'middleware';
  path: string;
  config?: T;
}

export interface MiddlewarePlugin<T = Config>  extends Middleware{
  type: 'plugin';
  path: string;
  description?: string;
  config?: T;

  [k: string]: unknown;
}

export interface MiddlewareCallback<T = Config> extends Middleware {
  type: 'after';
  description?: string;

  handler(): Promise<void>;

  handler(config: T): Promise<void>;

  [k: string]: unknown;
}

export interface MiddlewareAfter extends Middleware {
  type: 'after';
  description?: string;
  handler: {};

  [k: string]: unknown;
}

export interface MiddlewareRegister<T = Config> extends Middleware {
  type: 'register';
  description?: string;
  path: string;
  config?: T;

  [k: string]: unknown;
}

export type MiddlewareDefinition<T = Config> = (
  | MiddlewareMiddleware<T>
  | MiddlewarePlugin<T>
  | MiddlewareCallback<T>
  | MiddlewareAfter
  | MiddlewareRegister<T>
  );

