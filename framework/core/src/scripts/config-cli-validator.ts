/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {normalize, sep} from 'path';
import {sync} from 'glob';

// utils
import Jii from '../Jii';
import {isPath, trimSlashes} from '../helpers/path';
import {wrap} from '../helpers/array';
import {INTERNAL_METADATA, INTERNAL_CLI_DIRS} from '../utils/symbols';

// types
import {ApplicationConfig, CliDirectory} from '../typings/app-config';

/**
 * Validates cli 'dirs' existence
 * @param [dir] - Directory path to validate
 * @param [recursive] - Recursively find
 */
export const resolvePath = (dir: string, recursive: boolean = false): Array<string> => {
  const path = trimSlashes(normalize(Jii.getAlias(dir, false)));

  if (!isPath(path, 'dir')) {
    throw new Error(`${path} must be a valid directory`);
  }

  if (!recursive) {
    return [path + sep + 'commands'];
  }

  return [...sync('**/commands', {cwd: path, absolute: true})]
    .map(p => trimSlashes(normalize(p)));
};

type CliObj = { path: string; recursive: boolean };

/**
 * Normalizes cli 'dirs' to array of paths
 * @param [definition] - Dirs definition to validate
 */
export const normalizeDirs = (definition: CliDirectory): Array<string> => {
  const list: CliDirectory[] = ['@app']; // predefined directories
  list.push(...wrap(definition));

  const directories: Array<string> = [];

  for (const element of list) {
    if (typeof element === 'string') {
      directories.push(...resolvePath(element, false));
    }

    if (typeof element === 'object') {
      const {path, recursive} = <CliObj>element;
      directories.push(...resolvePath(path, recursive));
    }
  }

  console.log('directories:', directories);

  return [...new Set(directories)]; // unique filter, clean up duplicates
};

/**
 * Validates cli configuration
 */
export default (config?: ApplicationConfig['cli']): void => {
  // validates 'dirs' prop
  Jii.container.setConfig(INTERNAL_METADATA, {[INTERNAL_CLI_DIRS]: normalizeDirs(config?.dirs ?? [])});
}
