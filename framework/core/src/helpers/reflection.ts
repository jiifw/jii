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
  return val && (typeof val === 'function') && /^\s*class\s+/.test(val.toString());
};

/**
 * Get the class hierarchy including the class itself, its parent classes, and implemented interfaces.
 * @param className - The class name.
 * @returns Array of class names in the hierarchy.
 */
export const getClassHierarchy = (className: string): string[] => {
  const hierarchy = [className];
  let parentClass = Object.getPrototypeOf(className);

  while (parentClass) {
    hierarchy.push(parentClass.name);
    parentClass = Object.getPrototypeOf(parentClass);
  }

  return hierarchy;
};
