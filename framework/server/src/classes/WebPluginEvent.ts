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
import {ServerInstance} from '../typings/server';
import Application from './Application';

/**
 * A web plugin event
 */
export default class WebPluginEvent extends Event {
  /**
   * The HTTP server instance
   */
  public server: ServerInstance = null;

  /**
   * The server component instance
   */
  public owner: Server = null;
}
