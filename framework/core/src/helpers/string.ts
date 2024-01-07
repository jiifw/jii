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

interface MatchWildcardOptions {
  /** Whether slashes in string only matches slashes in the given pattern.
   * @default false
   */
  filePath?: boolean;
  /** Whether backslash escaping is enabled.
   * @default true
   */
  escape?: boolean;
  /**  Whether pattern should be case-sensitive.
   * @default true
   */
  caseSensitive?: boolean;
}

/**
 * Checks if the passed string would match the given shell wildcard pattern.
 *
 * @param pattern the shell wildcard pattern.
 * @param string the tested string.
 * @param [options] options for matching. Valid options are:
 *
 * - caseSensitive: bool, whether pattern should be case-sensitive. Defaults to `true`.
 * - escape: bool, whether backslash escaping is enabled. Defaults to `true`.
 * - filePath: bool, whether slashes in string only matches slashes in the given pattern. Defaults to `false`.
 *
 * @return Whether the string matches pattern or not.
 *
 * @see https://github.com/yiisoft/yii2/blob/b46e2676d347adba7ca43f59008cde9dd17f09f5/framework/helpers/BaseStringHelper.php#L417
 */
export const matchWildcard = (pattern: string, string: string, options: MatchWildcardOptions = {}) => {
  if (pattern === '*' && !options.filePath) {
    return true;
  }
  const replacements = {
    '\\\\\\\\': '\\\\',
    '\\\\\\*': '[*]',
    '\\\\\\?': '[?]',
    '\\*': '.*',
    '\\?': '.',
    '\\[\\!': '[^',
    '\\[': '[',
    '\\]': ']',
    '\\-': '-',
  };
  if (options.escape !== undefined && !options.escape) {
    delete replacements['\\\\\\\\'];
    delete replacements['\\\\\\*'];
    delete replacements['\\\\\\?'];
  }
  if (options.filePath) {
    replacements['\\*'] = '[^/\\\\]*';
    replacements['\\?'] = '[^/\\\\]';
  }
  pattern = pattern.replace(/\\(.)/g, (match, p1) => replacements[p1] || match);
  pattern = '^' + pattern + '$';
  if (options.caseSensitive !== undefined && !options.caseSensitive) {
    pattern += 'i';
  }
  return new RegExp(pattern, 'us').test(string.toString());
};

/**
 * Masks a portion of a string with a repeated character.
 * This method is multibyte-safe.
 *
 * @param string The input string.
 * @param start The starting position from where to begin masking.
 * This can be a positive or negative integer.
 * Positive values count from the beginning,
 * negative values count from the end of the string.
 * @param length The length of the section to be masked.
 * The masking will start from the start position
 * and continue for $length characters.
 * @param [mask] The character to use for masking. The default is '*'.
 * @return The masked string.
 */
export const mask = (string: string, start: number, length: number, mask: string = '*'): string => {
  const strLength = string.length;

  // Return original string if start position is out of bounds
  if (start >= strLength || start < -strLength) {
    return string;
  }

  let masked = string.substring(0, start);
  masked += mask.repeat(Math.abs(length));
  masked += string.substring(start + Math.abs(length));
  return masked;
};

