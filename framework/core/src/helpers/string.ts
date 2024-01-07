/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import {kebab} from './inflector';

/**
 * Fix slashes in the given string and transform into route
 */
export const sanitizeRoute = (route: string): string => {
  const sanitized = String(route || '')
    .replace(/\\+/g, '/')
    .replace(/^[/\\]/, '')
    .replace(/[/\\]$/, '');

  return sanitized.split('/').map(kebab).join('/').toLowerCase();
};

/**
 * Convert a non-string value into a string
 * @param val - The mixed value
 * @param [trim] - Trimming whitespaces?
 */
export const toString = (val: any, trim: boolean = false): string => {
  let str = ['object', 'function'].includes(typeof val)
    ? ''
    : String(val || '');

  if (trim) {
    str = str.trim();
  }

  return str;
};

/**
 * Replace a given string at a given index
 * @see https://stackoverflow.com/a/1431113
 * @param str - The input string
 * @param index - The index to start the replacement
 * @param replacement - The replacement string
 * @returns The modified string
 */
export function replaceAt(str: string, index: number, replacement: string) {
  return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}
