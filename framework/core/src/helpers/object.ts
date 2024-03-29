/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

/**
 * Check that the given object is an actual object or not
 */
/**
 * Check that the given object is an object
 * @param val - The input value to testify
 * @returns Returns true if the object otherwise false
 */
export const isObject = (val: any): boolean => {
  const type = typeof val;
  return type === 'function' || type === 'object' && !!val;
};

/**
 * Create an object by using the elements from one "keys" array and one "values" array:
 * @param keys - Array of keys
 * @param values - Array of values
 * @returns Returns the combined object. FALSE if number of elements does not match or arrays are not array
 */
export const combine = <V = any>(keys: string[], values: V[]): { [key: string]: V } | false => {
  if (!Array.isArray(keys)
    || !Array.isArray(values)
    || keys.length !== values.length) {
    return false;
  }

  const list: { [key: string]: V } = {};

  for (let i: number = 0; i < keys.length; i++) {
    const key: string = '' + keys[i];
    list[key] = values[i];
  }

  return list;
};

/**
 * Flip the object keys and values
 * @param obj - The input object
 * @returns Returns the new object with flipped keys and values
 */
export const flip = (obj: { [key: string]: any }): { [key: string]: any } | false => {
  return combine(Object.values<string>(obj), Object.keys(obj));
};

/**
 * Check that the given object is a plain {key: value} pairs object
 * @param val - The input value to testify
 * @returns Returns true if the object is a plain object
 * @see https://stackoverflow.com/a/68989785
 */
export const isPlainObject = (val: any): boolean => {
  return val && typeof val === 'object' && val?.constructor === Object;
};

/**
 * Get the object with only provided keys
 * @param obj - Plain object
 * @param keys - List of fields to have only
 * @param [excludeMode=false] - Reverse: Skip those fields which are provided in `keys`
 *
 * @example Include mode
 * const result = onlyKeys({a: 1, b: 2, c: 3}, ['a', 'b']);
 * console.log('Result:', result); // {a: 1, b: 2}
 *
 * @example Exclude mode (`excludeMode` param as true)
 * const result = onlyKeys({a: 1, b: 2, c: 3}, ['a', 'b'], true);
 * console.log('Result:', result); // {c: 3}
 */
export const onlyKeys = (obj: Record<string, any>, keys: Array<string> = [], excludeMode: boolean = false): Record<string, any> => {
  const objKeys = Object.keys(obj);

  if (!objKeys.length || !keys.length) return {};

  const normalized = objKeys
    .filter(key => excludeMode ? !keys.includes(key) : keys.includes(key))
    .map((key) => [key, obj[key]]);

  return Object.fromEntries(normalized);
};

/**
 * Prepend one or more elements to the beginning of an array
 * @param obj - The input object.
 * @param values - The values to be added to the beginning of the object.
 * @returns Returns the new number of elements in the object.
 *
 * @example
 * const grocery = {
 *  fruit: 'orange',
 * };
 *
 * unshift(queue, {vegetable: 'potato'});
 * // expected: {vegetable: 'potato', fruit: 'orange'}
 * console.log(grocery);
 */
export const unshift = <K extends string = string, V = any>(obj: Record<K, V>, ...values: Record<K, V>[]): Record<K, V> => {
  return {...values, ...obj};
};
