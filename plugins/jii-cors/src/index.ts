/**
 * Friendly CORS Plugin
 * @link https://www.github.com/jiifw/jii/plugins/jii-cors
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @version 0.0.1
 */

import merge from 'deepmerge';

// classes
import Plugin from '@jii/core/dist/classes/Plugin';

// utils
import Jii from '@jii/core/dist/Jii';
import Server from '@jii/server/dist/classes/Server';
import {getOrigin} from './utils';

// types
import {CorsOptions as NativeCorsOptions} from 'cors';

export interface CorsOptions {
  cors?: Partial<NativeCorsOptions>;
  errors?: {
    originBlocked?: string;
  };
}

/**
 * Friendly CORS Plugin
 */
export default class extends Plugin {
  id: Lowercase<string> = 'cors';
  name: Lowercase<string> = 'plugin-cors';

  /**
   * Plugin handler
   */
  async handler(): Promise<void> {
    const config = await this.getConfig<CorsOptions>({
        cors: {
          optionsSuccessStatus: 204,
          preflightContinue: true,
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
          credentials: true,
        },
        errors: {
          originBlocked: 'Not allowed by CORS',
        },
      },
    );

    const corsOptions = merge<NativeCorsOptions>(config.cors, {
      origin(origin, callback) {
        false !== getOrigin(origin)
          ? callback(null, true)
          : callback(new Error(config.errors.originBlocked));
      },
    });

    Jii.app().get<Server>('server')?.getServer()?.use(require('cors')(corsOptions));
  }
}
