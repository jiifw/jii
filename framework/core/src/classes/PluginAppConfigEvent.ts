/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Event from './Event';

// types
import {ApplicationConfig} from '../typings/app-config';

/**
 * The event class for the plugin.
 */
export default class PluginAppConfigEvent extends Event {
  /**
   * The application configuration
   */
  public config: ApplicationConfig;
}
