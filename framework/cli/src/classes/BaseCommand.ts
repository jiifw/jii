/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {Command as CommandNative, Command as Commander} from 'commander';
import {Argument, CommandOption} from '../typings/cli';

export default class BaseCommand {
  /**
   * Name of the namespace.
   */
  public name: string;

  /** Aliases to the command */
  public aliases?: Array<string> = [];

  /**
   * A short description regarding your command
   */
  public description: string = '';

  /** Argument that commend accepts */
  public argument(): Argument | void {}

  /**
   * The flags string contains the short and/or long flags, separated by comma,
   * a pipe or space. A required option-argument is indicated by <> and an
   * optional option-argument by [].
   *
   * @example
   * [..., {command: 'p'}] // minimal
   */
  options(): Array<CommandOption> {
    return [];
  }

  constructor(protected readonly cli: Commander) {
  }

  /**
   * Initialize the command.
   */
  async init(command?: CommandNative, program?: CommandNative): Promise<void> {
  }

  /**
   * Command processing logic handler
   */
  async action(name: string, options: Record<string, any>, command: CommandNative): Promise<void> {
  }
}
