/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {basename} from 'node:path';
import merge from 'deepmerge';
import objPath from 'object-path';

// classes
import Instance from '../classes/Instance';
import Application from '../classes/Application';
import Configuration from '../classes/Configuration';
import ConfigValidator from '../classes/ConfigValidator';
import InvalidArgumentError from '../classes/InvalidArgumentError';

// utils
import {isConstructor} from '../helpers/reflection';

// types
import {JSONSchema7} from 'json-schema';
import {Class, DeepPartial} from 'utility-types';
import {PropertyPath} from '../classes/ConfigValidator';
import {ApplicationConfig} from '../typings/app-config';

export type Args = {
  app: Application;
  config: ApplicationConfig;
  validators: string[];
}

class SkipProcessing {
}

type OptionalConf = Partial<ApplicationConfig>;

/**
 * Extract property names based configuration from app configuration
 * @param config - Application configurations
 * @param properties - Properties names to extract
 * @returns The extracted configuration
 */
const extractConfig = (config: OptionalConf, properties: PropertyPath | PropertyPath[]): OptionalConf | null => {
  if ('string' === typeof properties) {
    return !objPath.has(config, properties) ? null : objPath.get(config, properties, {});
  }

  if (Array.isArray(properties)) {
    let _config: OptionalConf = {};

    for (const prop of properties) {
      if (!objPath.has(config, prop)) {
        continue;
      }

      const element = {};
      objPath.set(element, prop, objPath.get(config, prop));
      _config = merge(_config, element);
    }

    return _config;
  }
  throw new InvalidArgumentError(`The propertyNames must be a string or array of string but '${typeof properties}' given`);
};

/**
 * Validates validator based configuration
 * @param validator - ConfigValidator instance
 */
const processConfig = async (validator: ConfigValidator): Promise<SkipProcessing | true> => {
  const jsonSchema = await validator.getSchema() as JSONSchema7;

  if ( jsonSchema ) {
    (new Configuration(validator.getConfig(), jsonSchema)).validate({}, true);

    if (!(await validator.afterSchemaValidate())) {
      return new SkipProcessing();
    }
  }

  await validator.validate();

  if (!(await validator.afterValidate())) {
    return new SkipProcessing();
  }

  return true;
};

/**
 * Create a config validator class from the given path
 * @param path - Path to the class
 * @param args - Argument pass to the constructor
 */
const createClassInstance = (path: string, args: any[] = []): ConfigValidator => {
  const ConfigClass = Instance.classFromPath(path) as Class<ConfigValidator>;

  if (!isConstructor(ConfigClass)) {
    throw new InvalidArgumentError(`The class '${basename(path)}' must be a constructor.`);
  }

  const validator = new ConfigClass(...args as any);

  if (!(validator instanceof ConfigValidator)) {
    throw new InvalidArgumentError(`The class '${basename(path)}' must be extended by 'ConfigValidator'.`);
  }

  return validator;
};

/**
 * Configuration validators preprocessor
 * @param app - Application instance
 * @param config - Application configurations
 * @param validators - List of core validators
 * @returns Updated configuration
 */
export default async ({app, config, validators}: Args): Promise<DeepPartial<ApplicationConfig>> => {
  if (!validators.length) {
    return config;
  }

  let confInstance = new Configuration(config);

  for await (const path of validators) {
    const validator = createClassInstance(path, [app, config, {}]);
    const validatorConfig = extractConfig(
      confInstance.getConfig(), validator.propertyName()
    );

    if (!validatorConfig) {
      continue;
    }

    validator.setConfig(validatorConfig as any);
    validator.init();

    const result = await processConfig(validator);
    if (result instanceof SkipProcessing) {
      continue;
    }

    await validator.apply();
    confInstance.merge(validator.getConfig());
  }

  return confInstance.getConfig();
}
