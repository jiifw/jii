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
