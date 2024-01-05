/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// scripts
import BaseApplication from '../classes/BaseApplication';
import createInstance from '../server/create-instance';

// utils
import {getNumberValue, getValue, isProdEnvironment} from '@jii/core/dist/env';

// types
import {ServerInstance, ServerRequest, ServerReply} from '../typings/server';
import {ApplicationConfig} from '../typings/app-config';

export type WebApplication = InstanceType<typeof Application>;

/**
 * Application is the base class for all web application classes.
 * @since 0.1
 */
export default class Application<
  Server extends ServerInstance = ServerInstance,
  Request extends ServerRequest = ServerRequest,
  Reply extends ServerReply = ServerReply
> extends BaseApplication<Server, Request, Reply> {
  /**
   * Run the application, start the server
   * @param [callback] - Callback function to execute after server is started
   */

  public async run(callback?: (server?: Server) => Promise<void>): Promise<void> {
    // Create, initialize and memorize server instance
    await createInstance(
      <ApplicationConfig><unknown>this.config, _server => this._server = <Server>_server,
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
