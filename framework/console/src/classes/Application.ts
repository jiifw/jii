/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import figlet from 'figlet';
import merge from 'deepmerge';
import {Command} from 'commander';

// classes
import BaseApplication, {Platform} from '@jii/core/dist/classes/Application';

// utils
import Jii from '@jii/core/dist/Jii';
import {listCommands} from '../utils/commands';
import {dirname} from '@jii/core/dist/helpers/path';

// types
import {ApplicationConfig} from '../typings/app-config';

/** Application version */
const APP_VERSION: string = '1.0.0';

/**
 * Application class
 */
export default class Application<T extends ApplicationConfig = ApplicationConfig> extends BaseApplication<T> {
  /**
   * @inheritDoc
   */
  protected _platform: Platform = 'console';

  /**
   * Console application instance
   * @protected
   */
  protected console: Command = null;

  /**
   * @inheritDoc
   */
  init() {
    super.init();
    Jii.setAlias('@jiiConsole', dirname(__dirname));
  }

  /**
   * Load command files
   * @protected
   */
  coreConfigValidators(): string[] {
    return merge(super.coreConfigValidators(), [
      `@jiiConsole/config/validators/ConsoleConfigValidator`,
    ]);
  }

  /**
   * Creates a console app instance
   * @protected
   */
  protected async createInstance(): Promise<void> {
    this.setVersion(APP_VERSION);
    this.console = new Command('jii');

    this.console
      .version(this.getVersion())
      .description('A Jii framework CLI for terminal operations');
  }

  /**
   * Load command files
   * @protected
   */
  protected async loadCommands() {
    const commands = await listCommands(this.console);

    commands.forEach(command => this.console.addCommand(command));
    this.console.showHelpAfterError('(add --help for additional information)');

    this.console.configureHelp({
      sortSubcommands: true,
      sortOptions: true,
    });
  }

  /**
   * @inheritDoc
   */
  public async run(): Promise<void> {
    await this.createInstance();
    await super.run();
    await this.loadCommands();

    console.log(figlet.textSync('Jii Framework'));

    if (!process.argv.length || !process.argv.slice(2).length) {
      this.console.outputHelp();
      return;
    }

    await this.console.parseAsync();
  }
}
