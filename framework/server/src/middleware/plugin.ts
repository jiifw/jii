/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import fp from 'fastify-plugin';

// classes
import Plugin from '@jii/core/dist/classes/Plugin';

// utils
import Jii from '@jii/core/dist/Jii';
import {isObject} from '@jii/core/dist/helpers/object';

// types
import {MiddlewarePlugin} from '@jii/core/dist/typings/middleware';
import {WebApplication} from '../web/Application';

/**
 * Register a custom plugin
 * @param plugin - Plugin metadata
 */
export const registerCustomPlugin = async <T>(plugin: MiddlewarePlugin<T>) => {
  const {path, config = {}} = plugin;

  const instance = Jii.createObject<InstanceType<typeof Plugin>>(path, [config || {}]);

  if (!(instance instanceof Plugin)) {
    throw new Error('Plugin must be an instance of Plugin base class');
  }

  if (!instance.id?.trim()) {
    throw new Error(`Plugin 'id' must be a non-empty string`);
  }

  if (!instance.name?.trim()) {
    throw new Error(`Plugin 'name' must be a non-empty string`);
  }

  if (instance.metadata() && !isObject(instance.metadata())) {
    throw new Error(`Plugin 'metadata' must be a valid object`);
  }

  await instance.beforeRegister();

  await Jii.app<WebApplication>().server.register(fp(instance.handler.bind(instance), instance.metadata()));
  await Jii.app<WebApplication>().server.after(async err => {
    if (err) throw err;
    await instance.afterRegister();
  });

  Jii.middleware.link(path, instance.id);
};
