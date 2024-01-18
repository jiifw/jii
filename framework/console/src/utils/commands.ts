/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {sync} from 'glob';
import {Command} from 'commander';

// utils
import Jii from '@jii/core/dist/Jii';
import {INTERNAL_CLI_DIRS, INTERNAL_METADATA} from '@jii/core/dist/utils/symbols';
import registerCommand from '../utils/register';

/**
 * Compile glob patterns for CLI commands.
 * @returns Array of glob patterns
 */
export const compileGlobPatterns = (): { path: string; pattern: string }[] => {
  //const patterns: string[];
  const paths: Array<string> = Jii.container.getConfig(INTERNAL_METADATA)?.[INTERNAL_CLI_DIRS] ?? [];

  // @todo Implementation of plugins commands here

  return paths.map(dir => ({
    path: dir,
    pattern: `*.@(js|ts)`,
  })) ?? [];
};

/**
 * Register CLI commands.
 * @param [instance] Program instance
 */

export const listCommands = async (instance: InstanceType<typeof Command>) => {
  const promises = compileGlobPatterns()
    .map(item => sync(item.pattern, {cwd: item.path, absolute: true}))
    .flat()
    // promising the list
    .map(file => registerCommand(require(file).default, file));

  return Promise.all(promises);
};
