/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {realpath} from 'node:fs/promises';

// classes
import Component from './Component';
import InvalidConfigError from './InvalidConfigError';

// utils
import Jii from '../Jii';
import {isFile} from '../helpers/path';

/**
 * Request represents a request that is handled by an {@link Application}.
 */
export default class Request extends Component {
  private _scriptFile: string = null;
  private _isConsoleRequest: boolean = null;

  /**
   * Returns a value indicating whether the current request is made via command line.
   * @returns The value indicating whether the current request is made via console
   */
  public getIsConsoleRequest(): boolean {
    return this._isConsoleRequest !== null ? this._isConsoleRequest : Jii.app().platform === 'console';
  }

  /**
   * Sets the value indicating whether the current request is made via command line.
   * @param value - The value indicating whether the current request is made via command line
   */
  public setIsConsoleRequest(value: boolean): void {
    this._isConsoleRequest = value;
  }

  /**
   * Returns entry script file path.
   * @return string entry script file path
   * @throws InvalidConfigError if the entry script file path cannot be determined automatically.
   */
  public getScriptFile() {
    if (this._scriptFile === null) {
      // @todo: implementation required
      throw new InvalidConfigError('Unable to determine the entry script file path');
    }

    return this._scriptFile;
  }

  /**
   * Sets the entry script file path.
   * @param value - Entry script file path
   */
  public async setScriptFile(value: string): Promise<void> {
    const scriptFile = await realpath(Jii.getAlias(value));
    this._scriptFile = value;

    if (scriptFile && isFile(scriptFile)) {
      this._scriptFile = scriptFile;
    } else {
      throw new InvalidConfigError('Unable to determine the entry script file path.');
    }
  }
}
