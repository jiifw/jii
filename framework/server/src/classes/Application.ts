/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */
import merge from 'deepmerge';

// classes
import BaseApplication from '@jii/core/dist/classes/Application';
import Server from './Server';

// utils
import {dirname} from '@jii/core/dist/helpers/path';

// types
import {ApplicationConfig} from '../typings/app-config';
import {ComponentsDefinition} from '@jii/core/dist/typings/components';

/**
 * Application is the base class for all web application classes.
 */
export default class Application extends BaseApplication {
  /**
   * An event raised before the application starts to handle a request.
   */

  //public static readonly EVENT_BEFORE_REQUEST = 'beforeRequest';
  /**
   * An event raised after the application successfully handles a request (before the response is sent out).
   */
  //public static readonly EVENT_AFTER_REQUEST = 'afterRequest';

  /**
   * @inheritDoc
   */
  protected _appType: 'web' | 'cli' = 'cli';

  preInit(config: ApplicationConfig) {
    this.setAliases({'@jiiServer': dirname(__dirname)});
    super.preInit(config);
  }

  /**
   * Run the application
   */
  public async run(): Promise<void> {
    await super.run();
    await this.get<Server>('server')?.start();
  }

  /**
   * Returns the configuration of core application components.
   * @see set()
   */
  public coreComponents(): ComponentsDefinition {
    return merge(super.coreComponents(), {
      server: {class: '@jiiServer/classes/Server'},
    });
  }
}
