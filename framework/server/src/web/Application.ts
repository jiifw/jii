/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// scripts
import BaseApplication from '../base/Application';
import createInstance from '../server/create-instance';

// utils
import Jii from '@jii/core/dist/Jii';
import {CONTAINER_APP_KEY} from '@jii/core/dist/BaseJii';
import {getNumberValue, getValue, isProdEnvironment} from '@jii/core/dist/env';
import {bindClass} from '@jii/core/dist/helpers/auto-bind';

// types
import {ServerInstance, ServerRequest, ServerReply} from '../typings/server';
import {ApplicationConfig} from '../typings/app';

/**
 * Application is the base class for all web application classes.
 * @since 0.1
 */
export default class Application<
  S extends ServerInstance = ServerInstance,
  Request extends ServerRequest = ServerRequest,
  Reply extends ServerReply = ServerReply
> extends BaseApplication<S, Request, Reply> {
  /**
   * Application constructor
   * @param config - Configuration
   */
  constructor(config: Partial<ApplicationConfig>) {
    super(config);
    bindClass(this);
    Jii.container.memoSync(CONTAINER_APP_KEY, this, {freeze: true});
  }

  /**
   * Run the application, start the server
   * @param [callback] - Callback function to execute after server is started
   */

  public async run(callback?: (server?: S) => Promise<void>): Promise<void> {
    // Create, initialize and memorize server instance
    await createInstance(
      <ApplicationConfig><unknown>this.config, _server => this._server = <S>_server,
    );

    const config = {
      host: getValue<string>('SERVER_HOST', 'localhost'),
      port: getNumberValue('SERVER_PORT', 8030),
    };

    try {
      await this._server.listen(config);
      // noinspection HttpUrlsUsage
      console.log(`Server is listening on: http://${config.host}:${config.port}`);

      if ('function' === typeof callback) {
        await callback.call(this, this._server);
      }
    } catch (err) {
      !isProdEnvironment() && console.log(err);
      this._server.log.error(err);
      process.exit(1);
    }
  }
}
