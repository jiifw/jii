/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// types
import {FastifyHttpOptions} from 'fastify';
import {DeepPartial} from 'utility-types';
import {ApplicationConfig as IApplicationConfig} from '@jii/core/dist/typings/app-config';

export interface ApplicationConfig extends IApplicationConfig {
  /**
   * Server configuration.
   */
  server?: DeepPartial<{
    /**
     * Fastify server options.
     */
    httpOptions: FastifyHttpOptions<undefined>;
  }>;
}
