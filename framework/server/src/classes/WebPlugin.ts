/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import Plugin from '@jii/core/dist/classes/Plugin';

/**
 * A base plugin class to create web application specific plugins
 */
export default class WebPlugin extends Plugin {
  /**
   * @event WebPluginEvent
   * An event raised while the web server is initiated
   */
  public static EVENT_SERVER_INIT: string = 'serverInit';
}
