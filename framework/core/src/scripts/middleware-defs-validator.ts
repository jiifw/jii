/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import Jii from '../Jii';
import {isObject} from '../helpers/object';
import {toString} from '../helpers/string';
import {isFunction} from '../helpers/function';
import {dirname, resolve} from '../helpers/path';

const CALLBACK_TYPES = ['callback', 'after'];
const PATH_TYPES = ['register', 'middleware', 'plugin'];

// types
import {
  MiddlewareDefinition, MiddlewareMiddleware,
  MiddlewarePlugin, MiddlewareRegister,
} from '../typings/middleware';

type PathMiddleware = MiddlewarePlugin | MiddlewareMiddleware | MiddlewareRegister;

/**
 * Register definition in a middleware registry
 * @param [def] - Middleware definition
 */
const reviseMiddlewareRegistry = (def: PathMiddleware): void => {
  if (!PATH_TYPES.includes(def.type)) {
    return ;
  }

  const filePath: string = resolve(def.path, false);

  Jii.middleware.register(def.path, def?.config ?? {}, {
    directory: dirname(filePath),
    type: def.type,
  });
};

/**
 * Validate middleware definition
 * @param [def] - Middleware definition
 * @throws Error when
 *  if definition is invalid
 * - The type is not supported
 * - The description is not a string
 * - The handler is not an async function
 * - The path is not a string
 * - The path is not a valid path
 */
const validateDefinition = (def: MiddlewareDefinition): void => {
  // prop: type
  if (!CALLBACK_TYPES.includes(def.type) && !PATH_TYPES.includes(def.type)) {
    throw new Error(`Middleware 'type' must be one of ${CALLBACK_TYPES.join(', ')} or ${PATH_TYPES.join(', ')} but '${def.type}' given`);
  }

  // prop: description
  if (def?.description) {
    if (!toString(def.description))
      throw new Error(`Middleware 'description' must be a string but ${typeof def.description} given`);
  }

  // prop: config
  if (def?.config && !isObject(def.config)) {
    throw new Error(`Middleware 'config' must be an object but ${typeof def.config} given`);
  }

  if (!(def.type === 'callback' || def.type === 'after')) {
    return;
  }

  // prop: type<'callback'|'after'>
  if (!isFunction(def.handler)) {
    throw new Error(`Middleware 'handler' must be a an async function but ${typeof def.handler} given`);
  }
};

/**
 * Register config 'middleware' definitions in a middleware registry
 * @param definitions - Middleware definitions
 */
export default function (definitions: Array<MiddlewareDefinition>): void {
  if (!definitions) {
    return;
  }

  if (!Array.isArray(definitions)) {
    throw new Error('Middleware definitions must be an array');
  }

  if (!definitions.length) {
    return;
  }

  for (const def of definitions) {
    validateDefinition(def);
    reviseMiddlewareRegistry(<PathMiddleware>def)
  }
}
