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

interface Middleware<T> {
  description?: string;
  config?: T;
}

export interface MiddlewareMiddleware<T = Config> extends Middleware<T> {
  type: 'middleware';
  path: string;
}

export interface MiddlewarePlugin<T = Config> extends Middleware<T> {
  type: 'plugin';
  path: string;
}

export interface MiddlewareRegister<T = Config> extends Middleware<T> {
  type: 'register';
  path: string;
}

export interface MiddlewareCallback<T = Config> extends Middleware<T> {
  type: 'callback';
  handler(config?: T): Promise<void> | void;
}

export interface MiddlewareAfter extends Middleware<undefined> {
  type: 'after';
  handler(error?: Error | null): Promise<void> | void;
}

export type MiddlewareDefinition<T = Config> = (
  | MiddlewareMiddleware<T>
  | MiddlewarePlugin<T>
  | MiddlewareCallback<T>
  | MiddlewareAfter
  | MiddlewareRegister<T>
  );

