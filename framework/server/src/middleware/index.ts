/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import Jii from '@jii/core/dist/Jii';
import {dirname} from '@jii/core/dist/helpers/path';
import {registerCustomPlugin} from './plugin';

// types
import {plugin} from '../typings/plugin';
import {
  MiddlewareAfter, MiddlewareCallback, MiddlewareMiddleware,
  MiddlewarePlugin, MiddlewareRegister, MiddlewareType, Registry,
} from './types';

// public types
export type {
  Registry, MiddlewarePlugin, MiddlewareMiddleware,
  MiddlewareCallback, MiddlewareType, MiddlewareRegister,
};

/**
 * Middleware supported types
 */
const middlewareTypes: MiddlewareType[] = [
  'middleware', 'after', 'callback', 'plugin', 'register',
];

/**
 * Apply a middleware registry to server instance
 * @param middleware - Middleware registry object
 *
 * @example
 *
 *await applyMiddleware([
 *  { path: 'fastify-favicon', type: 'register' },
 *  { path: '@jii/cors/dist', type: 'plugin' },
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
 *], server);
 */
export async function applyMiddleware<T>(middleware: Registry<T>): Promise<void> {
  if (!middleware.length) {
    return;
  }

  for await (const {type, ...data} of middleware) {
    if (!middlewareTypes.includes(type)) {
      throw new Error(`Unknown middleware type '${type}' given`);
    }

    if (['register', 'middleware', 'plugin'].includes(type)) {
      Jii.middleware.register((<any>data).path, (<any>data).config || {}, {
        directory: dirname((<any>data).path),
        type,
      });
    }

    if (type === 'register') {
      const params = <MiddlewareRegister<T>>data;
      await Jii.app().server.register(require(params.path), params.config || {});
    } else if (type === 'middleware') {
      const params = <MiddlewareMiddleware<T>>data;
      Jii.app().server.use(require(params.path)(params.config || {}));
    } else if (type === 'plugin') {
      await registerCustomPlugin<T>(<MiddlewarePlugin<T>>data);
    } else if (type === 'after') {
      await Jii.app().server.after((<MiddlewareAfter>data).handler);
    } else if (type === 'callback') {
      const params = <MiddlewareCallback<T>>data;
      await params.handler(Jii.app().server, params?.config || {});
    }
  }
}
