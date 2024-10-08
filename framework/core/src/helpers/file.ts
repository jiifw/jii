/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {basename, join, normalize} from 'node:path';
import {accessSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';

// utils
import Jii from '../Jii';
import {getAlias} from '~/base/aliases';
import {dirname, isFile, resolve} from './path';

/**
 * Read a text file
 * @param path - File path
 * @returns File content
 */
export function readTextFile(path: string): string {
  return readFileSync(getAlias(path, false), {encoding: 'utf8'});
}

/**
 * Read and parse a json file
 * @param path - File path
 * @returns Json object
 */
export function readJsonFile(path: string): any {
  return JSON.parse(readTextFile(path).trim() || '{}');
}

/**
 * Read and parse json schema file
 * @param path - File path
 * @returns Schema object
 * @example Without postfix
 * const schema = readSchemaFile('@app/schemas/request');
 * @example With postfix
 * const schema = readSchemaFile('@app/schemas/request.schema');
 */
export function readSchemaFile(path: string): any {
  path = /\.schema$/.test(path) ? path : `${path}.schema`;
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

  if (isFile(filePath)) {
    if (!overwrite) return false;
    unlinkSync(overwrite ? filePath : filePath);
  }

  writeFileSync(filePath, content, {encoding: 'utf8'});
  return isFile(filePath);
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

/**
 * Returns resolve file path (alias or npm-package)
 * @param path - The path / alias / npm-package to resolve
 * @param filename - The file name (for app specific)
 * @returns The resolved file
 */
export const resolveMainFile = (path: string, filename: string = 'index'): {dir: string, file: string, path: string} => {
  const data = { dir: '', file: '', path: '' };

  try {
    data.dir = normalize(Jii.getAlias(path, true));
    data.path = require.resolve(join(data.dir, filename));
    data.file = basename(data.path);
  } catch (e) {
    data.path = normalize(require.resolve(path));
    data.dir = dirname(data.path);
    data.file = basename(data.path);
  }

  return data;
}
