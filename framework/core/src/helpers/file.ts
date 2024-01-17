/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {accessSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';

// utils
import {isPath, resolve} from './path';
import {getAlias} from '../base/aliases';
import {normalize} from 'path';

/**
 * Read and parse a json file
 * @param path - File path
 */
export function readJsonFile(path: string): any {
  return JSON.parse(
    readFileSync(path, {encoding: 'utf8'}).trim() || '{}',
  );
}

/**
 * Read and parse json schema file
 * @param path - File path
 * @returns Schema object
 */
export function readSchemaFile(path: string): any {
  const filePath = require.resolve(normalize(getAlias(path)));
  return require(filePath).default ?? {};
}

/**
 * Require/Import a file and return the module
 * @param alias - Alias including filename (ext: .js | .ts)
 */
export const importFile = async (alias: string): Promise<any> => {
  return import(resolve(alias));
};

/**
 * Create a text file on filesystem
 * @param aliasOrPath - Alias or absolute directory path including filename (with extension)
 * @param content - Text to store in file
 * @param [overwrite] - Overwrite file upon exists?
 */
export const writeTextFile = (aliasOrPath: string, content: string, overwrite: boolean = false): boolean => {
  const filePath = getAlias(aliasOrPath, false);

  if (isPath(filePath, 'file')) {
    if (!overwrite) return false;
    unlinkSync(overwrite ? filePath : filePath);
  }

  writeFileSync(filePath, content, {encoding: 'utf8'});
  return isPath(filePath, 'file');
};

/**
 * Resolve the alias path and verify that path exists
 * @param aliasOrPath - Alias or absolute directory path including filename (with or w/o extension)
 */
export function exists(aliasOrPath: string): boolean {
  try {
    accessSync(resolve(aliasOrPath));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Invoke an asynchronous function in a module
 * @param aliasOrPath - Alias or absolute directory path including filename (with or w/o extension)
 * @param [method] - Function name to invoke
 * @param [args] - Arguments to pass to the function
 * @returns Result of the executed function
 *
 * @example
 * const output = await invokeModuleMethod('@app/modules/user', 'fetchDetailsById', [11]);
 */
export const invokeModuleMethod = async <T = any>(
  aliasOrPath: string, method: 'default' | string = 'default', args: Array<any> = [],
): Promise<T> => {
  if (!exists(aliasOrPath)) {
    return undefined;
  }

  const module = await importFile(aliasOrPath);

  if (!(method in module)) {
    throw new Error(`Not method '${method}' found in a module '${aliasOrPath}'`);
  }

  return <T>module[method].call(null, ...args);
};

/**
 * Invoke a synchronous function in a module
 * @param aliasOrPath - Alias or absolute directory path including filename (with or without extension)
 * @param [method] - Function name to invoke
 * @param [args] - Arguments to pass to the function
 * @returns Result of the function
 *
 * @example
 * const output = invokeModuleMethodSync('@app/modules/fs', 'cleanupTemp', []);
 */
export const invokeModuleMethodSync = <T = any>(
  aliasOrPath: string, method: 'default' | string = 'default', args: Array<any> = [],
): T => {
  if (!exists(aliasOrPath)) {
    return undefined;
  }

  const module = require(resolve(aliasOrPath));

  if (!(method in module)) {
    throw new Error(`Not method '${method}' found in a module '${aliasOrPath}'`);
  }

  return <T>module[method].call(null, ...args);
};
