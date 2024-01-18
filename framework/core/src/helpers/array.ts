/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

/**
 * Wraps an array or any value into an array
 * @param [arg] - Value to wrap
 * @returns Array of the value
 *
 * @example as non-array
 * wrap('mixed'); // expected: ['mixed']
 *
 * @example as array
 * wrap(['item1', 'item2']); // expected: ['item1', 'item2']
 */
export const wrap = <T = any>(arg: T): T[] => {
  return Array.isArray(arg) ? arg : [arg];
};

/**
 * Checks that list and haystack list items are valid and match
 * @param list - Input list
 * @param haystack - List to check and match with
 * @returns Whatever the list is matched or not
 */
export const isSame = <T = any>(list: T[], haystack: T[]): boolean => {
  if (!Array.isArray(list) || !list.length) return false;
  if (!Array.isArray(haystack) || !haystack.length) return false;
  return list.filter(val => haystack.includes(val)).length === list.length;
};

/**
 * Checks any list item or items include in haystack list
 * @param list - Input list
 * @param haystack - List to check and match in
 * @returns Whatever the items(s) present or not
 */
export const contains = <T = any>(list: T[], haystack: T[]): boolean => {
  if (!Array.isArray(list) || !list.length) return false;
  if (!Array.isArray(haystack) || !haystack.length) return false;

  return !!list.filter(val => haystack.includes(val)).length;
};
