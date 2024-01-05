/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

/**
 * Check if a function is an async function that returns a promise or nor
 * @param [func] - Function to check
 * @returns true if the function is an async function
 */
export const isAsyncFunction = (func: any): boolean => {
  return 'function' === typeof func
    && (<Function>func).constructor.name === 'AsyncFunction';
};

/**
 * Check if a function is a non-async function and does not return a promise
 * @param [func] - Function to check
 * @returns true if the function is a sync function
 */
export const isSyncFunction = (func: any): boolean => {
  return 'function' === typeof func
    && (<Function>func).constructor.name === 'Function';
};

/**
 * Check if a function is an actual a function or not
 * @param [func] - Function to check
 * @returns true if the function is a function
 */
export const isFunction = (func: any): boolean => {
  return isSyncFunction(func) || isAsyncFunction(func);
};
