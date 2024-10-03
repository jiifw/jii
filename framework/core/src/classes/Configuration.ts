/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import merge from 'deepmerge';

// utils
import {bindClass} from '~/helpers/auto-bind';
import {invokeModuleMethod} from '~/helpers/file';
import {newInstance, parseError} from '~/helpers/ajv';

// types
import {ValidateFunction} from 'ajv';
import {JSONSchema7} from 'json-schema';

export {JSONSchema7};

export interface DataValidationCxt<T extends string | number = string | number> {
  instancePath: string;
  parentData: { [K in T]: any }; // object or array
  parentDataProperty: T; // string or number
  rootData: Record<string, any> | any[];
  dynamicAnchors: { [Ref in string]?: ValidateFunction };
}

export type ConfigLastError = { message: string, key: string };

/**
 * Configuration utility class to merge, validate (based on JSONSchema) and parse configuration
 */
export default class Configuration<T> {
  protected lastError: ConfigLastError | null = null;

  /**
   * Configuration constructor
   * @param config - Configuration object
   * @param [schema] - JSON schema for the configuration
   */
  constructor(private config: T, private schema: JSONSchema7 = {}) {
    bindClass(this);
  }

  /**
   * Get the configuration schema
   */
  getSchema(): JSONSchema7 {
    return this.schema;
  }

  /**
   * Set the configuration schema
   * @param schema - JSON schema for the configuration
   */
  setSchema(schema: JSONSchema7): void {
    this.schema = schema;
  }

  /**
   * Get the configuration
   */
  getConfig(): T {
    return this.config;
  }

  /**
   * Merge the configuration with current config
   * @param config - Configuration object
   */
  merge(config: T): void {
    this.config = <T>merge(this.config, config || {});
  }

  /**
   * Merge a configuration from the given file or alias
   * @param aliasOrPath - Alias or absolute directory path including filename (with extension)
   * @param [args] - Arguments to pass to the invoker function
   */
  async mergeFile(aliasOrPath: string, args: any[] = []): Promise<void> {
    const _config = await invokeModuleMethod<T>(aliasOrPath, 'default', args);
    this.merge(_config);
  }

  /**
   * Validate the configuration
   * @param [context] - Validation context *(optional)*
   * @param [throwException] - Throw exception if validation fails *(optional)*
   */
  validate(context: Partial<DataValidationCxt<undefined>> = {}, throwException: boolean = false): boolean {
    this.lastError = null;

    const validate = newInstance().compile(this.getSchema());

    if (!validate(this.config, <DataValidationCxt<undefined>>context)) {
      this.lastError = parseError(validate);
      if (throwException) {
        throw new Error(this.lastError.message);
      }
      return false;
    }
    return true;
  }

  /**
   * Get the last validation error / Null if all ok
   */
  getLastError(): ConfigLastError | null {
    return this.lastError;
  }
}
