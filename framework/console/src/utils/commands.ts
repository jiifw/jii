/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {sync} from 'glob';
import {join} from 'node:path';
import {Command} from 'commander';

// utils
import Jii from '@jii/core/dist/Jii';
import {APP_CONFIG} from '@jii/core/dist/utils/symbols';
import registerCommand from '../utils/register';

// types
import {ApplicationConfig} from '../typings/app-config';

/**
 * Compile glob patterns for CLI commands.
 * @returns Array of glob patterns
 */
export const compileGlobPatterns = (): { path: string; pattern: string }[] => {
  const paths: string[] = Jii.container.retrieve<ApplicationConfig>(APP_CONFIG)?.console?.dirs as string[] ?? [];
  const pluginsList = Jii.plugins.pluginsMetadata(['commands', 'base-path']);

  if (Object.keys(pluginsList).length) {
    for (const meta of Object.values(pluginsList)) {
      if (meta?.commands) paths.push(join(meta['base-path'], 'commands'));
    }
  }

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
    .map(item => sync(item.pattern, {
      cwd: item.path,
      absolute: true,
      ignore: ['*.d.ts'],
    }))
    .flat()
    // promising the list
    .map(file => registerCommand(file as any, file));

  return Promise.all(promises);
};
