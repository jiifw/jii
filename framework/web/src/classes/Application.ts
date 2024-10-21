/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */
import merge from 'deepmerge';

// classes
import Server from './Server';
import UrlManager from './UrlManager';
import BaseApplication from '@jii/core/dist/classes/Application';

// utils
import {dirname} from '@jii/core/dist/helpers/path';

// types
import {ComponentsDefinition} from '@jii/core/dist/typings/components';
import {Props} from '@jii/core/dist/classes/BaseObject';
import {ApplicationConfig} from '~/typings/app-config';

/**
 * Application is the base class for all web application classes.
 */
export default class Application extends BaseApplication {
  /**
   * @inheritDoc
   */
  protected _platform: 'web' | 'cli' | string = 'web';

  /**
   * An event raised before the application starts to handle a request.
   */

  //public static readonly EVENT_BEFORE_REQUEST = 'beforeRequest';
  /**
   * An event raised after the application successfully handles a request (before the response is sent out).
   */
  //public static readonly EVENT_AFTER_REQUEST = 'afterRequest';

  /**
   * Application constructor
   * @param config - Application configuration
   * @param [props] - Component properties
   */
  public constructor(config: ApplicationConfig, props: Props = {}) {
    super(config as any, props);
    this.init();
  }

  /**
   * @inheritDoc
   */
  init() {
    this.setAliases({'@jiiWeb': dirname(__dirname)});
    super.init();
  }

  /**
   * @inheritDoc
   */
  public async run(): Promise<void> {
    await super.run();
    await this.get<Server>('server')?.start();
  }

  /**
   * Returns the URL manager for this application.
   * @returns The URL manager for this application.
   */
  public getUrlManager<T extends UrlManager = UrlManager>(): T {
    return this.get<T>('urlManager');
  }

  /**
   * @inheritDoc
   */
  public coreComponents(): ComponentsDefinition {
    return merge(super.coreComponents(), {
      server: {class: '@jiiWeb/classes/Server'},
      request: {class: '@jiiWeb/classes/Request'},
      response: {class: '@jiiWeb/classes/Response'},
      accessToken: {class: '@jiiWeb/classes/AccessToken'},
      urlManager: {class: '@jiiWeb/classes/UrlManager'},
    });
  }
}
