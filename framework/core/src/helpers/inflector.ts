/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import Case from 'case';

// utils
import { toString } from './string';

/**
 * Returns given string as kebab-cased.
 *
 * Converts a word like "send_email" to "send-email".
 */
export const kebab = (str: string): string => {
  return Case.kebab(toString(str))
    .replace(/^-+/, '')
    .replace(/-+/g, '-')
    .replace(/-+$/, '');
};

/**
 * Returns given string as underscored.
 *
 * Converts a word like "Send-email" to "send_email".
 * @see kebab
 */
export const underscore = (str: string): string => {
  return kebab(str).replace(/-+/g, '_');
};

/**
 * Returns given string as CamelCased.
 *
 * Converts a word like "send_email" to "SendEmail".
 * @param str - The input string to CamelCase
 */
export const camelCase = (str: string): string => Case.camel(toString(str));

/**
 * Returns given string as first char uppercase.
 *
 * Converts a word like "send_email" to "Send_email".
 * @param str - The input string to CamelCase
 */
export const ucFirst = (str: string): string => {
  return toString(str).charAt(0).toUpperCase() + toString(str).slice(1);
};

/**
 * Returns given string as first char lowercase.
 *
 * Converts a word like "Send_Email" to "send_Email".
 * @param str - The input string to CamelCase
 */
export const lcFirst = (str: string): string => {
  return toString(str).charAt(0).toLowerCase() + toString(str).slice(1);
};

/**
 * Returns given string as PascalCased.
 *
 * Converts a word like "send_email" to "SendEmail".
 * @param str - The input string
 */
export const pascal = (str: string): string => Case.pascal(str);

/**
 Returns given string as variable name (JS).
 *
 * Converts a word like "send_email" to "sendEmail". It
 * will remove non-alphanumeric character from the word, so
 * "who's online" will be converted to "whoSOnline".
 *
 * @param str - The input string
 */
export const variablize = (str: string): string => {
  const cleaned: string = toString(str)
    .replace(/[^a-z0-9_]+/ig, '_')
    .replace(/^\d+/, '')
    .replace(/^_+/, '_');
  return camelCase(cleaned);
};

/**
 * Returns given string as class name
 *
 * Converts a word like "send_email" to "SendEmail". It
 * will remove non-alphanumeric character from the input, so
 * "who's online" will be converted to "WhoSOnline".
 *
 * @param str - The input string
 */
export const classname = (str: string): string => {
  return ucFirst(variablize(str));
};

/**
 * Returns given string as constant name (JS).
 *
 * Converts a word like "send_email" to "sendEmail". It
 * will remove non-alphanumeric character from the input, so
 * "who's online" will be converted to "WHO_S_ONLINE".
 *
 * @param str - The input string
 */
export const constant = (str: string): string => {
  return underscore(variablize(str)).toUpperCase();
};

/**
 * Returns given string as constant name (JS).
 *
 * Converts a word like "send_email" to "sendEmail". It
 * will remove non-alphanumeric character from the input, so
 * "who's online" will be converted to "WHO_S_ONLINE".
 *
 * @param str - The input string
 */
export const camel2id = (str: string): string => {
  return kebab(variablize(str)).toUpperCase();
};

/**
 * Returns given string as constant name (JS).
 *
 * Converts a word like "send_email" to "sendEmail". It
 * will remove non-alphanumeric character from the input, so
 * "who's online" will be converted to "WHO_S_ONLINE".
 *
 * @param str - The input string
 */
export const id2Camel = (str: string): string => {
  return camelCase(variablize(str)).toUpperCase();
};

/**
 * Returns given string as title.
 *
 * Converts a word like "foo v. bar" to "Foo v. Bar".
 *
 * @param str - The input string
 */
export const titleize = (str: string): string => Case.title(str);
