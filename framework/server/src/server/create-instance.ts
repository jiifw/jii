/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import fastify from 'fastify';
import merge from 'deepmerge';

// utils
import Jii from '@jii/core/dist/Jii';
import {getBoolValue, isProdEnvironment} from '@jii/core/dist/env';
import {invokeModuleMethod} from '@jii/core/dist/helpers/file';
import {importConfigFile} from '@jii/core/dist/base/config';
import {applyMiddleware} from '../middleware';

// types
import {ServerHTTPOptions, ServerInstance} from '../typings/server';
import {ApplicationConfig} from '../typings/app';

/**
 * Invoke bootstrapper files and register them to the server instance
 * @param files
 * @param server - Server instance
 */
const invokeBootstraps = async (files: string | string[], server: ServerInstance): Promise<void> => {
  const list = Array.isArray(files) ? files : [files];

  if (!list.length) return;

  for await (const path of list) {
    await invokeModuleMethod(path, 'default', [server]);
  }
};

/**
 * Creates a new server instance
 * @param config - Application configuration
 * @param onInit - Application instance
 */
export default async function createInstance(config: ApplicationConfig, onInit: (server: ServerInstance) => void): Promise<ServerInstance> {
  const serverConfig = await importConfigFile<ServerHTTPOptions>(
    '@app/config/server.ts', merge(
      <ServerHTTPOptions>config?.server?.httpOptions || {}, {
        logger: !isProdEnvironment() && getBoolValue('SERVER_LOGGING', false),
      },
    ),
  );

  const server = <ServerInstance><unknown>fastify(serverConfig);

  // register middleware engine
  await server.register(require('@fastify/middie'));

  onInit(server);

  Jii.setLogger(server.log); // sets logger

  // Only available after request (in routes, otherwise unavailable)
  await server.addHook('onRequest', async (request, reply) => {
    Jii.setSync('request', request, {freeze: true});
    Jii.setSync('response', reply, {freeze: true});
  });

  // initialize bootstrapper(s)
  await invokeBootstraps(config.bootstrap, server);

  await applyMiddleware([
    //{path: '@framework/plugins/auto-controllers', type: 'plugin'},
    //{path: '@framework/plugins/auto-modules', type: 'plugin'},
  ]);

  return server;
}
