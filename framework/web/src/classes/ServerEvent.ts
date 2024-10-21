/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Event from '@jii/core/dist/classes/Event';
import Server from './Server';

// types
import {ServerInstance} from '~/typings/server';

/**
 * An event that is fired when a server is started or crashed.
 */
export default class ServerEvent extends Event {
  /**
   * The HTTP server instance
   */
  server: ServerInstance;

  /**
   * The server component instance
   */
  owner: Server;
}
