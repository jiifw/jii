/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {normalize} from 'path';
import {sync} from 'glob';

// utils
import Jii from '@jii/core/dist/Jii';
import {isPath, trimSlashes} from '@jii/core/dist/helpers/path';
import {CliDirectory} from '@jii/core/dist/typings/app-config';
import {INTERNAL_METADATA, INTERNAL_CLI_DIRS} from '@jii/core/dist/utils/symbols';

/**
 * Validates cli 'dirs' existence
 * @param [dir] - Directory path to validate
 * @param [recursive] - Recursively find
 */
const resolvePath = (dir: string, recursive: boolean = false): Array<string> => {
  const path = trimSlashes(normalize(Jii.getAlias(dir, false)));

  if (!isPath(path, 'dir')) {
    throw new Error(`${path} must be a valid directory`);
  }

  const pattern: string = recursive ? '**/commands' : 'commands';

  return [...sync(pattern, {cwd: path, absolute: true})]
    .map(p => trimSlashes(normalize(p)));
};

/**
 * Validates cli 'dirs' existence
 * @param [dirDef] - List of directories path to validate
 */
const normalizeDirs = (dirDef: CliDirectory): Array<string> => {
  const list = !Array.isArray(dirDef) ? [dirDef] : dirDef;

  const directories: Array<string> = [
    '@app', // predefined current app directory
  ];

  for (const element of list) {
    if (typeof element === 'string') {
      directories.push(...resolvePath(element, false));
    }

    if (typeof element === 'object') {
      directories.push(...resolvePath(element.path, element.recursive));
    }
  }

  return [...new Set(directories)]; // unique filter, clean up duplicates
};

/**
 * Validates cli configuration
 */
export default (): void => {
  const {cli} = Jii.app().config;

  Jii.container.setConfig(INTERNAL_METADATA, {[INTERNAL_CLI_DIRS]: normalizeDirs(cli?.dirs ?? [])});

  console.log(Jii.container);
}
