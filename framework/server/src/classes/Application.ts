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

// utils
import {dirname} from '@jii/core/dist/helpers/path';

// scripts
//import createInstance from '../server/create-instance';

// types
import {ApplicationConfig} from '../typings/app-config';
import {ComponentsDefinition} from '@jii/core/dist/typings/components';
import Server from './Server';

/**
 * Application is the base class for all web application classes.
 * @since 0.1
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

  preInit(config: ApplicationConfig) {
    this.setAliases({'@jiiServer': dirname(__dirname)});
    super.preInit(config);
  }

  /**
   * Run the application, start the server
   * @param [callback] - Callback function to execute after server is started
   */
  public async run(callback?: (server?: any) => Promise<void>): Promise<void> {
    await this.get<Server>('server')?.start(callback);
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
