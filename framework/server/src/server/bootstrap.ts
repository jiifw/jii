/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import { applyMiddleware } from '../middleware';

/**
 * Server bootstrapper
 */
export default async (): Promise<void> => {
  // Register middlewares'
  await applyMiddleware([
    { path: 'fastify-favicon', type: 'register' },
    //{ path: '@framework/plugins/cors', type: 'plugin' },
    //{ path: '@framework/plugins/rate-limit', type: 'plugin' },
    { path: 'fastify-graceful-shutdown', type: 'register' },
    { path: 'x-xss-protection', type: 'middleware' },
    { path: '@fastify/accepts', type: 'register' },
    { path: '@fastify/url-data', type: 'register' },
    { path: '@fastify/cookie', type: 'register' },
    { path: '@fastify/formbody', type: 'register' },
    { path: '@fastify/multipart', type: 'register', config: { attachFieldsToBody: 'keyValues' } },
    {
      async handler(error: any) {
        if (error) throw error;
      },
      type: 'after',
    },
  ]);
}
