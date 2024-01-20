/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {isAsyncFunction, isFunction, isPromise, isSyncFunction} from './function';
import {isPlainObject} from './object';

export type ArrayValueType =
  | 'string' | 'function' | 'async' | 'sync' | 'array-plain'
  | 'object' | 'number' | 'int' | 'float' | 'array'
  | 'array-empty' | 'null' | 'undefined' | 'promise';

/**
 * Convert any value to array
 * @param value - Value to convert
 * @returns Array of the value
 */
export const toArray = <T = any>(value: T): T[] =>
  Array.isArray(value) ? value : [value];

/**
 * Validate the value against type function
 * @private
 */
const arrayTypes: Record<ArrayValueType, ((value: any) => boolean)> = {
  'string': value => 'string' === typeof value,
  'function': value => isFunction(value),
  'async': value => isAsyncFunction(value),
  'sync': value => isSyncFunction(value),
  'promise': value => isPromise(value),
  'object': value => isPlainObject(value),
  'number': value => Number(value) === value,
  'int': value => Number.isInteger(value) === value,
  'float': value => Number(value) === value && !Number.isInteger(value),
  'array': value => Array.isArray(value),
  'array-empty': value => Array.isArray(value) && value.length === 0,
  'array-plain': value => Array.isArray(value) && value.length === 1,
  null: value => value === null,
  undefined: value => value === undefined,
};

/**
 * Check if all the values of array has the given type or not
 * @param list - The input array
 * @param type - The type to check
 * @returns Whatever the list is of the type or not
 */
export const isArrayOf = <T = any>(list: T[], type: ArrayValueType): boolean => {
  if (!Array.isArray(list) || !list.length || !arrayTypes.hasOwnProperty(type)) {
    return false;
  }

  const checker = arrayTypes[type];

  for (const value of list) {
    if (!checker(value)) return false;
  }

  return true;
};

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

/**
 * Check if the array has any duplicate values
 * @param arr - The input array
 * @returns Whatever the duplicates has or not
 */
export const hasDuplicates = <T>(arr: T[]): boolean => {
  return arr.length !== new Set(arr).size;
};

/**
 * Remove all duplicate values from given array
 * @param arr - The input array
 * @returns The new array without duplicates
 */
export const uniqueOnly = <T>(arr: Array<T>): Array<T> => {
  return [...new Set<T>(arr)];
};

/**
 * Check that all values exist in a list
 * @param list - The source array
 * @param check - The target array
 * @returns Whatever the items has or not
 */
export const containsItems = <T>(list: Array<T>, check: Array<T>): boolean => {
  return !!check.filter(v => !list.includes(v)).length;
};

/**
 * Check that all values doest not exist in a list
 * @param list - The source array
 * @param check - The target array
 * @returns Whatever the items has or not
 */
export const notContainsItems = <T>(list: Array<T>, check: Array<T>): boolean => {
  return !!check.filter(v => list.includes(v)).length;
};

/**
 * Sort an array by key in reverse order
 * @param input - The input array or object
 * @param [sortArrays] - Whether to sort array or object
 * @returns A sorted object or array
 */
export const krSort = <T>(input: T, sortArrays: boolean = false): T => {
  if (!input || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    const newArr = input.map((item) => krSort(item, sortArrays));
    if (sortArrays) {
      newArr.sort();
    }
    return newArr as T;
  }

  const ordered = {};
  Object.keys(input)
    .sort()
    .forEach((key) => {
      ordered[key] = krSort(input[key], sortArrays);
    });

  return ordered as T;
};
