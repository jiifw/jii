/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

/**
 * Checks if the value is a class
 * @param val - The value
 */
export const isClass = (val: any): boolean => {
  return typeof val === 'function' && /^\s*class\s+/.test(val.toString());
};
