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
import {ApplicationConfig} from '~/typings/app-config';

/**
 * ConfigurationEvent represents the event parameter used for finalizing configuration event.
 *
 * By setting the {@link config} property, one may change/update the final configuration.
 */
export default class ConfigurationEvent<T extends ApplicationConfig = ApplicationConfig> extends Event {
  /**
   * Application configuration
   */
  public config: T = null;
}
