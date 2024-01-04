/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {normalize} from 'node:path';

// classes
import Configuration from '@jii/core/dist/classes/Configuration';

// utils
import {isPath, resolve} from '@jii/core/dist/helpers/path';

// types
import {ApplicationConfig} from '../typings/app';

// schemas
import schemaConfig from '../schemas/configuration.schema';
import Jii from '@jii/core/dist/Jii';

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

  Jii.setAlias('@app', normalize(basePath), true);

  if (bootstrap) {
    const list = Array.isArray(bootstrap) ? bootstrap : [bootstrap];
    for (const file of list) {
      try {
        if (!isPath(resolve(file), 'file')) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error ('Trap error');
        }
      } catch (e) {
        throw new Error(`File '${file}' is not found in a 'bootstrap', File must be a valid file`);
      }
    }
  }
}
