/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {basename} from 'path';
import {Command} from 'commander';

// utils
import {toString} from '@jii/core/dist/helpers/string';
import {validateCommand} from './validators';
import processCommandOptions from './command-options';
import {CommandStatic, CommandInstance} from '../classes/BaseCommand';

// types
import Jii from '@jii/core/dist/Jii';

/**
 * @private
 * Formats command name including module name
 * @param instance - CommandBase instance
 * @param filePath - Absolute file path
 * @returns Formatted command name
 */

export const formatName = (instance: CommandInstance, filePath: string): string => {
  let name = !toString(instance?.name, true)
    ? basename(filePath, '.ts')
    : instance.name;

  if ( name.includes('.') ) {
    name = name.replace(/\.+/ig, ':');
  }

  return toString(instance?.module)
    ? `${instance?.module}:${name}`
    : name;
};

export default async function registerCommand(Class: CommandStatic, filePath: string): Promise<Command> {
  const instance = Jii.createObject<CommandInstance>(Class, []);
  const name = formatName(instance, filePath);

  instance.description ??= `no description available for command`;

  await validateCommand(instance);

  const command = new Command(name);

  command.aliases(instance.aliases);
  command.description(instance.description);

  await processCommandOptions(command, instance.options());

  if (instance?.init) {
    instance?.init.apply(undefined, [command]);
  }
  command.action((...args) => {
    const _args = args.length < 3
      ? [null, ...args]
      : args;

    instance.action.apply(undefined, <any>_args);
  });

  //<editor-fold desc="arguments processing">
  const argument = instance?.argument();

  if (argument) {
    const args: [string, string] | [string, string, unknown] = [
      argument.name,
      argument.description,
    ];

    if (argument.defaultValue) {
      args.push(<string>argument.defaultValue);
    }

    command.argument(...args);
  }
  //</editor-fold>

  command.configureHelp({
    sortSubcommands: true,
    sortOptions: true,
  });

  return command;
}
