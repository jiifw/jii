/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import figlet from 'figlet';
import {Command} from 'commander';

// classes
import BaseApplication from '@jii/core/dist/classes/Application';

// utils
import {listCommands} from '../utils/commands';

// types
import {ApplicationConfig} from '../typings/app-config';

/**
 * Application class
 */
export default class Application extends BaseApplication<ApplicationConfig> {
  /**
   * @inheritDoc
   */
  protected _appType = 'cli';

  /**
   * Run the application, start the cli server
   * @param [callback] - Callback function to execute when the application is ready
   */
  async run(callback?: () => Promise<void>): Promise<void> {
    const program = new Command('jii');

    console.log(figlet.textSync('Jii Framework'));

    program
      .version('1.0.0')
      .description('A Jii framework CLI for terminal operations');

    const commands = await listCommands(program);
    commands.forEach(command => program.addCommand(command));
    program.showHelpAfterError('(add --help for additional information)');

    program.configureHelp({
      sortSubcommands: true,
      sortOptions: true,
    });

    if (!process.argv.length || !process.argv.slice(2).length) {
      program.outputHelp();
      return;
    }

    await program.parseAsync();
  }
}
