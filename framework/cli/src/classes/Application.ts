/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import BaseApplication from '@jii/core/dist/classes/BaseApplication';

// types
import {ApplicationConfig} from '../typings/app-config';

/**
 * Application class
 */
export default abstract class Application extends BaseApplication<ApplicationConfig> {
  /**
   * Run the application, start the cli server
   * @param [callback] - Callback function to execute when the application is ready
   */

  public async run(callback?: () => Promise<void>): Promise<void> {
  }
}
