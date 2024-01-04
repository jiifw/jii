/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

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
     * - 'drive:/path/to/commands' // Absolute path
     * - '@app/commands' // Alias path
     * - '@app∕**∕commands' // wildcard entries
     * - '@app/directory∕**∕commands' // wildcard directory specific
     * - '@jii/plugin∕commands' // Jii package specific directory
     * @example Multiple directories
     * [
     *  'drive:/path/to/commands', // Absolute path
     *  '@app/commands', // Alias path
     *  '@app∕**∕commands', // wildcard entries
     *  '@app/directory∕**∕commands', // wildcard directory specific
     *  '@jii/plugin∕commands' // Jii package specific directory
     * ]
     */
    dirs: string | Array<string>
  };
  /**
   * Aliases for the application to register
   * @example
   * {
   *   'somePath': '@app/bootstrap/pre',
   *   '@path': path.dirname(__dirname),
   *   ...
   * }
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
   */
  params?: Record<string, any>;
  /*modules?: {
    [name: string]: {
      [property: string]: any;
    };
  };*/
  /*
  components?: {
    [name: string]: any;
  };
  middleware?: {
    [name: string]: any;
  };*/
}
