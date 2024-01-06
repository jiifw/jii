/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {MiddlewareDefinition} from './middleware';

export type CliDirectory = string | { path: string; recursive?: boolean } | (string | { path: string; recursive?: boolean })[];

/**
 * Application configuration typing interface
 */
export interface ApplicationConfig {
  /**
   * Application ID (e.g., 'ecommerce-platform' or 'superficial-project')
   */
  id: string;
  /**
   * Absolute path to the root directory of the application
   */
  basePath: string;
  /**
   * The absolute or alias path to the bootstrap file(s)<br>
   * <span color="red">Warning</span>: Do not include extensions like '.ts' or '.js' in the path.<br>
   * @example As a single file
   * 'app/bootstrap/main'
   * @example Multiple files
   * ['@app/bootstrap/pre','app/bootstrap/post']
   * @default []
   */
  bootstrap?: string | Array<string>;
  /**
   * Command line (cli) related configuration
   */
  cli?: {
    /**
     * The absolute or alias directory path to the cli command files<br>
     * **Note**: It will _only read_ files with the extension of
     * *<span color="green">`<name>.cmd.ts`</span>* or *<span color="green">`<name>.cmd.js`</span> (after build)*.
     * @example Single directory
     * - 'drive:/path/to' // Absolute path (assuming 'drive:/path/to/commands' directory)
     * - '@app' // Alias path (assuming '@app/commands' directory)
     * - {dir: '@app', recursive: true} // Recursive mode (assuming '@app∕**∕commands' in all subdirectories)
     * @example Multiple directories
     * [
     *  'drive:/path/to', // Absolute path (assuming 'drive:/path/to/commands' directory)
     *  '@app', // Alias path (assuming '@app/commands' directory)
     *  {dir: '@app', recursive: true}, // Recursive mode (assuming '@app∕**∕commands' in all subdirectories)
     * ]
     * @default '@app'
     */
    dirs?: CliDirectory;
  };
  /**
   * Aliases for the application to register
   * @example
   * {
   *   'somePath': '@app/bootstrap/pre',
   *   '@path': path.dirname(__dirname),
   *   ...
   * }
   * @default undefined
   */
  aliases?: Record<string, string>;
  /**
   * Additional parameters to store with the application to access later<br>
   * To access in later application, use: `Jii.instance().params['secret'];`
   * @example
   * {
   *   'db': {server: 'localhost', ...},
   *   'secret': '<random-hash-here>',
   * }
   * @default undefined
   */
  params?: Record<string, any>;
  /**
   * Middlewares to register with the application<br>
   * **Note**: The path argument supports alias, you can use `@app/plugins/some-plugin` to register the plugin
   * @example
   * [
   *  { type: 'plugin', path: '@jii/cors/dist' }, // 'plugin': Jii based plugin
   *  { type: 'register', path: 'fastify-favicon' }, // 'register': A server based plugin
   *  { type: 'middleware', path: 'x-xss-protection' }, // 'middleware': A server based middleware
   *  {
   *    type: 'after', // A server based event
   *    async handler(error: any) {
   *      if (error) throw error;
   *    },
   *  },
   *  {
   *    type: 'callback', // A server based event
   *    async handler(config?: {[key: string]: unknown}) {
   *      // logic here
   *    },
   *  },
   * ]
   * @default []
   */
  middleware?: Array<MiddlewareDefinition>;
  /*modules?: {
    [name: string]: {
      [property: string]: any;
    };
  };*/
  /*
  components?: {
    [name: string]: any;
  };
  */
}
