/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {Command, Option} from 'commander';

// utils
import {validateCommandOption} from './validators';

// types
import {CommandOption} from '../typings/cli';

/**
 * Bind options to the given command
 * @param command - Command instance
 * @param [options] - Options to bind
 */
export default async (
  command: InstanceType<typeof Command>, options: CommandOption[] = undefined,
): Promise<void> => {
  if (!Array.isArray(options) || !options.length) {
    return;
  }

  for (const option of options) {
    await validateCommandOption(option);

    const flags: Array<string> = [option.flag];

    if (option.argument) {
      flags.push(option.argument);
    }

    const instance = new Option(flags.join(' '), option.description);
    option.default && instance.default(option.default);
    option.choices && instance.choices(option.choices);

    instance.makeOptionMandatory(Boolean(option?.required));

    command.addOption(instance);
  }
}
