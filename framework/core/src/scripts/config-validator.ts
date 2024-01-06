/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {normalize} from 'node:path';

// classes
import Configuration from '../classes/Configuration';

// scripts
import middlewareDefsValidator from './middleware-defs-validator';

// utils
import Jii from '../Jii';
import {isPath, resolve} from '../helpers/path';
import configCliValidator from '../scripts/config-cli-validator';

// types
import {ApplicationConfig} from '../typings/app-config';

// schemas
import schemaConfig from '../schemas/configuration.schema';

/**
 * Validates and verify the application configuration
 * @param [bootstrap] - bootstrap file(s)
 */
const bootstrapPropValidator = (bootstrap: string | string[]): void => {
  if (!bootstrap) {
    return;
  }

  const list = Array.isArray(bootstrap) ? bootstrap : [bootstrap];
  for (const file of list) {
    try {
      if (!isPath(resolve(file), 'file')) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('Trap error');
      }
    } catch (e) {
      throw new Error(`File '${file}' is not found in a 'bootstrap', File must be a valid file`);
    }
  }
};

/**
 * Initializes application aliases
 * @param basePath - application base path
 */
const initAliases = ({basePath}): void => {
  Jii.setAlias('@app', normalize(basePath), true);
};

/**
 * Validates and verify the application configuration
 * @param config - application configuration
 */
export default function (config: ApplicationConfig): void {
  (new Configuration(config, schemaConfig)).validate({}, true);

  const {basePath, bootstrap} = config;

  if (!isPath(basePath, 'dir')) {
    throw new Error(`Application's 'basePath' must be a valid directory`);
  }

  // init aliases
  initAliases({basePath});

  // 'bootstrap' prop validator
  bootstrapPropValidator(bootstrap);

  // 'middleware' definitions validator
  middlewareDefsValidator(config?.middleware);

  // 'cli' prop validator
  configCliValidator(config?.cli);
}
