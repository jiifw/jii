/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {Command as CommandClass} from 'commander';

// classes
import Component from '@jii/core/dist/classes/Component';

// types
import {Class} from 'utility-types';
import {Argument, CommandOption} from '../typings/cli';

// public types
export type CommandInstance = InstanceType<typeof BaseCommand>;
export type CommandStatic = Class<BaseCommand>;
export type Command = InstanceType<typeof CommandClass>;
export type {Argument, CommandOption} from '../typings/cli';

/**
 * Base class for a creating command
 *
 * @example /path/to/commands/generate.ts
 * import {BaseCommand} from '@jii/cli/dist/classes/BaseCommand';
 * export default class extends BaseCommand {
 *  name = 'test';
 *  description = 'Express your command';
 *
 *  async action(): Promise<void> {
 *    console.log(`Hello from 'test' command`);
 *  }
 *  //...
 * }
 */
export default class BaseCommand extends Component {
  /**
   * Name of the command to show/execute in cli.<br>
   * By default, it's the name of the file.
   * @example 'generate'
   */
  public name: string;

  /**
   * Module name to prefix command. (e.g., 'app' -> eventually becomes 'app:generate' [format: '<module>:<name>'])
   * @example 'app'
   */
  public module: string;

  /**
   * (required) The description appears in the help for the command.
   */
  public description: string;

  /** Aliases to the command<br>
   * **Note**: Multiple aliases is unusual but supported! You can call alias multiple times,<br>
   * and/or add multiple aliases at once. Only the first alias is displayed in the help.
   * @example As a single alias
   * ['gen']
   *
   * @example Multiple
   * ['gen', 'new-gen']
   */
  public aliases?: Array<string> = [];

  /**
   * For subcommands, you can specify the argument syntax in the call. This is the only method usable<br>
   * for subcommands implemented using a stand-alone executable, but for other subcommands you can instead<br>
   * use the following method.
   *
   * @example
   * argument(): Argument {
   *  return {
   *   name: 'password',
   *   description: 'password for user, if required',
   *   defaultValue: 'no password given',
   *  };
   * }
   */
  public argument(): Argument | undefined {
    return undefined;
  }

  /**
   * The flags string contains the short and/or long flags, separated by comma,
   * a pipe or space. A required option-argument is indicated by <> and an
   * optional option-argument by [].
   *
   * @example
   * options(): Array<CommandOption> {
   *  return [{
   *    flag: '-type, --type',
   *    argument: '<name>',
   *    description: 'User type to change',
   *  }];
   * }
   */
  options(): Array<CommandOption> {
    return [];
  }

  /**
   * Initialize the command.<br>
   * **Note**: For advance customization, please check {@link https://github.com/tj/commander.js Commander.js docs}.
   * @example
   * init(command: Command): void
   *  command
   *   .summary("make a copy")
   *   .description(`Make a copy of the current project. This may require additional disk space.`);
   * }
   */
  init(command?: Command): void {
  }

  /**
   * The action handler gets passed a parameter for each command-argument you declared,<br>
   * and two additional parameters which are the parsed options and the command object itself.<br>
   * **Tip**: You can read documentation {@link https://github.com/tj/commander.js?#action-handler here}
   *
   * @param [arg] - Argument name (if supplied) otherwise null
   * @param [options] - Options pass to the command
   * @param [command] - Command instance
   * @example
   * async action(arg: string, options: Record<string, any>): Promise<void> {
   *  if (options?.debug) {
   *    console.error('Called %s with options %o', command.name(), options);
   *  }
   *  const title = options.title ? `${options.title} ` : '';
   *  console.log(`Thank-you ${title}${name}`);
   * }
   * @see https://github.com/tj/commander.js/blob/master/examples/thank.js
   */
  async action(arg?: string | null, options?: { [name: string]: string }, command?: Command): Promise<void> {
    throw new Error('Action not implemented');
  }
}
