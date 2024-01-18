/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import {isObject} from '@jii/core/dist/helpers/object';
import {toString} from '@jii/core/dist/helpers/string';

// types
import {CommandOption, Argument} from '../typings/cli';
import {CommandInstance} from '../classes/Command';

/**
 * Validate command option
 * @param option - Command option
 */
export const validateCommandOption = async (option: CommandOption): Promise<void> => {
  if (!toString(option?.description)) {
    throw new Error(`Option's 'description' must not be empty`);
  }

  if (toString(option?.flag) && !/^(-[a-z], --[a-z]-?[a-z]+)|(--[a-z]-?[a-z]+)$/.test(option?.flag)) {
    throw new Error(`Option's 'flag' must follow the correct format: --flag or -f, --flag`);
  }

  if (toString(option?.argument) && !/(\[[a-z][a-z-]+]|<[a-z][a-z-]+>)/.test(option?.argument)) {
    throw new Error(`Option's 'argument' should be one of them [[a-z][a-z-]+] or <[a-z][a-z-]+>`);
  }

  if (option?.choices && !Array.isArray(option?.choices)) {
    throw new Error(`Option's 'choices' should be an array of string`);
  }
};

const validateAliases = (aliases: string[]): void => {
  if ( !aliases ) {
    return;
  }

  if (!Array.isArray(aliases)) {
    throw new Error(`'aliases' should be a an array instead of a ${typeof aliases}`);
  }

  for (const alias of aliases) {
    if (!toString(alias, true)) {
      throw new Error(`Alias must be a string but ${typeof alias} given`);
    }
    if (!/^[a-z]([a-z\d]+)*$/.test(alias)) {
      throw new Error(`Alias must follow the proper format. (e.g., 'g' or 'generator')`);
    }
  }
}

/**
 * Validate command params
 * @param instance - CommandClass instance
 */
export const validateCommand = async (instance: CommandInstance) => {
  if (!toString(instance?.description, true)) {
    throw new Error('Description should not be empty');
  }

  if (toString(instance?.module) && !/^[a-z][a-z\d]+(-[a-z][a-z0-9]+)*$/.test(instance?.module)) {
    throw new Error(`Option's'module' should follow the proper format. (e.g., 'cors' or 'my-app'`);
  }

  validateAliases(instance.aliases);
  validateArguments(instance?.argument());
};

/**
 * Validate command argument
 * @param argument - Command argument
 */
const validateArguments = async (argument: Argument | undefined) => {
  if (!argument) {
    return;
  }

  if (!isObject(argument)) {
    throw new Error(`Option's 'argument' should be an object`);
  }

  if (!toString(argument?.name)) {
    throw new Error(`Option's 'argument.name' should not be empty`);
  }

  if (!toString(argument?.description)) {
    throw new Error(`Option's 'argument.description' should not be empty`);
  }

  if (argument?.defaultValue && !toString(argument?.defaultValue)) {
    throw new Error(`Option's 'argument.defaultValue' should be a string`);
  }
};
