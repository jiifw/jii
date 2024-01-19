/**
 * Friendly CORS Plugin
 * @link https://www.github.com/jiifw/jii/plugins/jii-cors
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @version 0.0.1
 */

import merge from 'deepmerge';
import {parse} from 'node:url';

// classes
import WebPlugin from '@jii/web/dist/classes/WebPlugin';
import ServerEvent from '@jii/web/dist/classes/ServerEvent';

// types
import {CorsPluginDefinition} from './types';

/**
 * Friendly CORS Plugin
 */
export default class extends WebPlugin {
  /**
   * Cors options
   */
  public cors: CorsPluginDefinition['cors'] = {};

  /**
   * Errors label
   */
  public errors: CorsPluginDefinition['errors'] = {};

  /**
   * List of allowed origins hostname names
   *
   * @example ['localhost', 'example.com']
   */
  public allowedOrigins: CorsPluginDefinition['allowedOrigins'] = [];

  /**
   * @inheritDoc
   */
  events() {
    return {
      [WebPlugin.EVENT_SERVER_INIT]: 'onServerInit',
    };
  }

  /**
   * An event handler for the server init event.
   * @param event - The server event
   */
  public async onServerInit(event: ServerEvent): Promise<void> {
    if (!this.getProperty<string[]>('allowedOrigins')?.length) {
      this.getProperty<string[]>('allowedOrigins').push(event.owner.host);
    }

    const config = {
      cors: merge({
        optionsSuccessStatus: 204,
        preflightContinue: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
      }, this.cors),
      errors: merge({
        originBlocked: 'Not allowed by CORS',
      }, this.errors),
    };

    const corsOptions = merge<CorsPluginDefinition['cors']>({
      origin: (origin, callback) => {
        false !== this.validateOrigin(origin)
          ? callback(null, true)
          : callback(new Error(config.errors.originBlocked));
      },
    }, config.cors);

    event.server?.use(require('cors')(corsOptions));
  }

  /**
   * Validates the origin from request
   * @param origin - Request origin
   * @returns True if request is from allowed origin or false if not
   */
  public validateOrigin(origin: string): boolean {
    // Set true when non-browser request
    if (!origin) {
      return true;
    }

    const {hostname} = parse(origin, false);

    for (const wlOrigin of this.allowedOrigins) {
      if (wlOrigin.includes(hostname)) {
        return true;
      }
    }

    return false;
  }
}
