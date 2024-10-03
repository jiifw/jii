/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import npath from 'node:path';
import nfs, {mkdirSync} from 'node:fs';

// utils
import {getAlias, hasAlias} from '~/base/aliases';

/**
 * Given a string containing the path of a file or directory, this function
 * will return the parent directory's path that is levels up from the current directory.
 * @param path - A path.
 * @param [levels] The number of parent directories to go up.
 * This must be an integer greater than 0.
 * @returns Returns the path of a parent directory. If there are no slashes in path,
 * a dot ('.') is returned, indicating the current directory. Otherwise, the returned
 * string is path with any trailing /component removed.
 *
 * @example Default behavior
 * // expected: '/etc'
 * console.log(dirname("/etc/passwd"));
 *
 * @example More than a single level
 * // expected: '/user/etc'
 * console.log(dirname("/user/etc/passwd/config", 2));
 */
export const dirname = (path: string, levels: number = 1): string => {
  if (!levels || levels < 1) {
    throw new Error('Levels cannot be negative');
  }

  let newPath = path;

  for (let i = 1; i <= levels; i++) {
    newPath = npath.normalize(npath.join(newPath, '..'));
  }

  return newPath;
};

/**
 * Omit `dist` directory from the given (aliased) path.
 * @param path - The path
 * @param [throwException] - Throw error when alias not found or alias is not registered.
 * @returns The resolved path
 *
 * @example Default
 * // expected: '/project/path'
 * console.log(noDistDir('/project/dist/path'));
 */
export const noDistDir = (path: string, throwException: boolean = false): string => {
  const resolvedPath = npath.normalize(getAlias(path, throwException));
  return resolvedPath.includes('dist')
    ? resolvedPath.replace(/dist([\\/])/, '')
    : resolvedPath;
};

/**
 * Get root directory path
 * @param [joins] - Paths to join (optional)
 *
 * @example Default
 * // expected: '/project/path'
 * console.log(root());
 *
 * @example With a filename
 * // expected: '/project/path/package.json'
 * console.log(root('package.json'));
 */
export const root = (...joins: string[]): string => {
  return npath.normalize(npath.join(dirname(__dirname, 2), ...joins));
};

/**
 * Resolve the given path to file or directory.
 * Note: Having alias in path will automatically replace by the value
 * @param path - The path
 * @param throwException - Throw error when alias not found or alias is not registered.
 * @returns The resolved path
 *
 * @example
 * // expected: '/project/path/framework/utils/file.ts'
 * console.log(resolvePath('@framework/utils/file'));
 */
export const resolve = (path: string, throwException: boolean = false): string => {
  return npath.normalize(require.resolve(getAlias(path, throwException)));
};

/**
 * Normalize path, Fix path slashes issue (OS related)
 * @param path - Path to normalize
 * @returns The normalized path
 */
export const normalize = (path: string): string => {
  return npath.resolve(path).replace(/\\/g, '/');
};

/**
 * Normalize the list of paths (resolve aliases and fix slashes)
 * @param list - List of paths
 * @param [postfix] - Postfix to add to each path
 * @param [throwException] - Throw error when alias not found or alias is not registered.
 * @returns The list of paths with resolved aliases and fixed slashes
 */
export const normalizePathList = async (
  list: Array<string>, postfix: string = '', throwException: boolean = false,
): Promise<Array<string>> => {
  const newList: Array<string> = [];

  for (const path of list) {
    if (hasAlias(path)) {
      newList.push(getAlias(path, throwException) + postfix);
      continue;
    }

    newList.push(path + postfix);
  }

  return newList;
};

/**
 * Check that the given path exists and is directory or a file
 * @param path - Path to check
 * @param [type] - Type of the path (file or dir)
 * @returns `true` if the path exists and is a directory or a file, `false` otherwise
 */
export const isPath = (path: string, type: 'dir' | 'file' = 'file'): boolean => {
  const _path = normalize(path);

  if (!nfs.existsSync(_path)) {
    return false;
  }

  const stat = nfs.lstatSync(npath.normalize(_path));
  return type === 'dir' && stat.isDirectory()
    || type === 'file' && stat.isFile();
};

/**
 * Tells whether the filename is a regular file
 * @param filename - Path to the file. If filename is a relative filename,
 * it will be checked relative to the current working directory.
 * If filename is a symbolic or hard link then the link will be resolved and checked.
 *
 * @returns `true` if the filename exists and is a regular file, `false` otherwise
 */
export const isFile = (filename: string): boolean => {
  return isPath(filename, 'file');
};

/**
 * Tells whether the path is a directory
 * @param path - Path to the directory. If path is a relative,
 * it will be checked relative to the current working directory.
 *
 * @returns `true` if the path exists and is a directory, `false` otherwise
 */
export const isDir = (path: string): boolean => {
  return isPath(path, 'dir');
};

/**
 * Synchronously creates a directory recursively.
 * @param aliasOrPath - Alias or absolute directory path
 * @returns `true` if the directory was created, `false` otherwise
 * @param [throwException] - Throw error when alias not found or alias is not registered.
 * @returns `true` if the directory was created, `false` otherwise
 */
export const createDir = (aliasOrPath: string, throwException: boolean = false): boolean => {
  const dirPath = npath.normalize(getAlias(aliasOrPath, throwException));
  mkdirSync(dirPath, {recursive: true});
  return isPath(dirPath, 'dir');
};

/**
 * Trim slashes from the end of the given path
 * @param path - Path to trim slashes from
 * @returns The trimmed path
 */
export const trimSlashes = (path: string): string => {
  return String(path || '').trim().replace(/[/\\]+$/, '');
};
