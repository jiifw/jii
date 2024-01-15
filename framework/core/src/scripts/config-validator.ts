/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {normalize} from 'node:path';
import obPath from 'object-path';

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
import {isLanguage} from '../helpers/locale';
import InvalidConfigError from '../classes/InvalidConfigError';
import {isTimezone} from '../helpers/datetime';

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
 * Basic properties validator
 * @param config - application configuration
 */
const basicPropsValidator = (config: ApplicationConfig): void => {
  if (config?.language && !isLanguage(config.language)) {
    throw new InvalidConfigError(`Application's 'language' must be a part of ISO 639`);
  }

  if (config?.sourceLanguage && !isLanguage(config.sourceLanguage)) {
    throw new InvalidConfigError(`Application's 'sourceLanguage' must be a part of ISO 639`);
  }

  if (config?.timeZone && !isTimezone(config.timeZone)) {
    throw new InvalidConfigError(`Application's 'timeZone' must be a valid time zone`);
  }
};

/**
 * Validates and verify the application configuration
 * @param config - application configuration
 */
export default function (config: ApplicationConfig): void {
  (new Configuration(config, schemaConfig)).validate({}, true);

  const {basePath, bootstrap} = config;

  if (!isPath(basePath, 'dir')) {
    throw new InvalidConfigError(`Application's 'basePath' must be a valid directory`);
  }

  basicPropsValidator(config);

  // init aliases
  initAliases({basePath});

  // 'bootstrap' prop validator
  bootstrapPropValidator(bootstrap);

  // 'middleware' definitions validator
  middlewareDefsValidator(config?.middleware);

  // 'cli' prop validator
  configCliValidator(config?.cli);
}
