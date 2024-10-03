/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {Path} from 'object-path';

// classes
import BaseObject, {Props} from './BaseObject';
import InvalidCallError from './InvalidCallError';
import Application from './Application';

// types
import {JSONSchema7} from 'json-schema';
import {ApplicationConfig} from '~/typings/app-config';

// public types
export type Schema = JSONSchema7;
export type PropertyPath = Path;

/**
 * A class to validate configuration based on JSON schema
 */
export default class ConfigValidator<
  T extends ApplicationConfig = ApplicationConfig,
  A extends Application = Application,
> extends BaseObject {

  /**
   * ConfigValidator constructor
   * @param app - The application instance
   * @param config - The configuration object
   * @param [props] - Initial properties.
   */
  constructor(private app: A, private config: T, props: Props = {}) {
    super(props);
  }

  /**
   * An event that triggers after the config is set and processing is being start
   */
  public async beforeProcess (): Promise<void> {}

  /**
   * Returns property name to retrieve object in application configuration
   */
  public propertyName(): PropertyPath | PropertyPath[] {
    throw new InvalidCallError('Not implemented yet');
  }

  /**
   * Returns configuration object
   */
  public getApp(): A {
    return this.app;
  }

  /**
   * Returns configuration object
   */
  public getConfig(): T {
    return this.config;
  }

  /**
   * Replace the existing configuration with given one
   * @param config - The configuration object
   */
  public setConfig(config: T): void {
    this.config = config;
  }

  /**
   * Returns configuration JSON schema
   */
  public async getSchema(): Promise<Schema | null> {
    return null;
  }

  /**
   * An event function invoked after the configuration is validated against JSON schema<br>
   * **Note**: This method must return true, false will skip the further processing.
   * @see {@link getSchema getSchema()}
   */
  public async afterSchemaValidate(): Promise<boolean> {
    return true;
  }

  /**
   * Validates configuration properties<br>
   * **Note**: Throw error if you want to halt the process otherwise assume as valid
   */
  public async validate(): Promise<void> {
  }

  /**
   * An event function invoked after the configuration validation is done<br>
   * **Note**: This method must return true, false will skip the further processing.
   * @see {@link validate validate()}
   */
  public async afterValidate(): Promise<boolean> {
    return true;
  }

  /**
   * Apply configuration to the application after schema and properties validation
   */
  public async apply(): Promise<void> {
  }
}
