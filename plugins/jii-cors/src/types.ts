/**
 * Friendly CORS Plugin
 * @link https://www.github.com/jiifw/jii/plugins/jii-cors
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @version 0.0.1
 */

// types
import {CorsOptions as NativeCorsOptions} from 'cors';
import {PluginDefinition} from '@jii/core/dist/typings/plugin';

/**
 * Cors plugin definition
 */
export interface CorsPluginDefinition extends PluginDefinition {
  /**
   * Cors options
   */
  cors?: Partial<NativeCorsOptions>;

  /**
   * Errors messages
   */
  errors?: {
    /**
     * Error message to display when origin is not matched
     * @default 'Not allowed by CORS'
     */
    originBlocked?: string;
  };

  /**
   * List of allowed origins hostname names
   *
   * @example ['localhost', 'example.com']
   */
  allowedOrigins?: string[];
}
