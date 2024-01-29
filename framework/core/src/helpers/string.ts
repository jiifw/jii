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

/**
 * Strip whitespace (or other characters) from a string
 * @param str - The input string.
 * @param dir - Direction to replace from let or right or both
 * @param [characters] - You can also specify the characters you want to strip, by means
 * of the characters' parameter. Simply list all characters that you want to be stripped.
 * With .. you can specify a range of characters.
 * @return This function returns a string with whitespace stripped from a string.
 * @see https://locutus.io/php/strings/ltrim/
 * @private
 */
const _lr_trim = (str: string, dir: 'left' | 'right' | 'both', characters: string = ' \\\\s\u00A0'): string => {
  characters = !characters.trim()
    ? ' \\s\u00A0'
    : (characters + '').replace(/([[\]().?/*{}+$^:])/g, '$1');

  let rgx = `[${characters}]+`;
  dir === 'left' && (rgx = '^' + rgx);
  dir === 'right' && (rgx = rgx + '$');

  const re = new RegExp(rgx, 'g');
  return (str + '').replace(re, '');
};

/**
 * Strip whitespace (or other characters) from the beginning of a string
 * @param str - The input string.
 * @param [characters] - You can also specify the characters you want to strip, by means
 * of the characters' parameter. Simply list all characters that you want to be stripped.
 * With .. you can specify a range of characters.
 * @return This function returns a string with whitespace stripped from the beginning of string.
 * @see https://locutus.io/php/strings/ltrim/
 */
export const ltrim = (str: string, characters: string = ' \\\\s\u00A0'): string => {
  return _lr_trim(str, 'left', characters);
};

/**
 * Strip whitespace (or other characters) from the end of a string
 * @param str - The input string.
 * @param [characters] - You can also specify the characters you want to strip, by means
 * of the characters' parameter. Simply list all characters that you want to be stripped.
 * With .. you can specify a range of characters.
 * @return This function returns a string with whitespace stripped from the end of string.
 */
export const rtrim = (str: string, characters: string = ' \\\\s\u00A0'): string => {
  return _lr_trim(str, 'right', characters);
};

/**
 * Strip whitespace (or other characters) from the beginning or end of a string
 * @param str - The input string.
 * @param [characters] - You can also specify the characters you want to strip, by means
 * of the characters' parameter. Simply list all characters that you want to be stripped.
 * With .. you can specify a range of characters.
 * @return This function returns a string with whitespace stripped from the end of string.
 */
export const trim = (str: string, characters: string = ' \\\\s\u00A0'): string => {
  return _lr_trim(str, 'both', characters);
};

/**
 * Uppercase the first character of each word in a string
 * @param str - The input string.
 * @returns Returns the modified string.
 * @see https://locutus.io/php/strings/ucwords/
 */
export const ucwords = (str: string): string => {
  return toString(str).replace(/^(.)|\s+(.)/g, $1 => $1.toUpperCase());
};

/**
 * Find the position of the first occurrence of a substring in a string
 * @param haystack - The string to search in.
 * @param needle - The string to search for.
 * @param offset - If specified, search will start this number of characters counted from the
 * beginning of the string. If the offset is negative, the search will start this number of
 * characters counted from the end of the string.
 * @returns Returns the position of where the needle exists relative to the beginning of the
 * haystack string (independent of offset). Also note that string positions start at 0, and not 1.
 *
 * @example
 * strpos('Kevin van Zonneveld', 'e', 5) // 14
 */
export const strpos = (haystack: string, needle: string, offset: number = 0): number | false => {
  const i = toString(haystack).indexOf(needle, (offset || 0));
  return i === -1 ? false : i;
};

/**
 * Return part of a string
 * @param string - The input string.
 * @param offset - If offset is non-negative, the returned string will start at the offset'th position in string, counting from zero. For instance, in the string 'abcdef', the character at position 0 is 'a', the character at position 2 is 'c', and so forth.
 * If offset is negative, the returned string will start at the offset'th character from the end of string.
 * If string is less than offset characters long, an empty string will be returned.
 *
 * @param length - If length is given and is positive, the string returned will contain at most length characters beginning from offset (depending on the length of string).
 * If length is given and is negative, then that many characters will be omitted from the end of string (after the start position has been calculated when a offset is negative). If offset denotes the position of this truncation or beyond, an empty string will be returned.
 * If length is given and is 0, an empty string will be returned.
 * If length is omitted or null, the substring starting from offset until the end of the string will be returned.
 * @returns Returns the extracted part of string, or an empty string.
 *
 * @example
 * substr("abcdef", 0, -1);  // returns "abcde"
 * substr("abcdef", 2, -1);  // returns "cde"
 * substr("abcdef", 4, -4);  // returns ""; prior to PHP 8.0.0, false was returned
 * substr("abcdef", -3, -1); // returns "de"
 *
 * @see https://locutus.io/php/strings/substr/
 */
export const substr = (string: string, offset: number, length: number = undefined): string | false => {
  string = toString(string);

  const inputLength = string.length;
  let end = inputLength;

  if (offset < 0) {
    offset += end;
  }

  if (length) {
    if (length < 0) {
      end = length + end;
    } else {
      end = length + offset;
    }
  }

  if (offset > inputLength || offset < 0 || offset > end) {
    return false;
  }

  return string.slice(offset, end);
};

/**
 * Binary safe string comparison of the first n characters
 * @param string1 - The first string
 * @param string2 - The second string
 * @param length - Number of characters to use in the comparison
 * @returns Less 0 if <i>string1</i> is less than <i>string2</i>; &gt; 0 if <i>string1</i>
 * is greater than <i>string2</i>, and 0 if they are equal.
 */
export const strncmp = (string1: string, string2: string, length: number): number => {
  const s1 = (string1 + '').substring(0, length);
  const s2 = (string2 + '').substring(0, length);
  return (s1 === s2 ? 0 : (s1 > s2 ? 1 : -1));
};

/**
 * Find the position of the last occurrence of a substring in a string
 * @see https://github.com/locutusjs/locutus/blob/master/src/php/strings/strrpos.js
 * @param haystack The string to search in.
 * @param needle If <b>needle</b> is not a string, it is converted to an integer and applied as the ordinal value of a character.
 * @param [offset] If specified, search will start this number of characters counted from the beginning of the string.
 * If the value is negative, search will instead start from that many characters from the end of the string, searching backwards.
 * @returns <p>
 * Returns the position where the needle exists relative to the beginning of
 * the <b>haystack</b> string (independent of search direction
 * or offset).
 * Also note that string positions start at 0, and not 1.
 * </p>
 * <p>
 * Returns <b>FALSE</b> if the needle was not found.
 * </p>
 */
export const strrpos = (haystack: string, needle: string, offset: number = 0): number | false => {
  let i: number = -1;
  if (offset) {
    i = toString(haystack).slice(offset).lastIndexOf(needle);
    if (i !== -1) i += offset;
  } else {
    i = toString(haystack).lastIndexOf(needle);
  }

  return i >= 0 ? i : false;
};
