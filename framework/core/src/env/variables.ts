/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import obp, {Path} from 'object-path';

// utils
import {getAlias} from '~/base/aliases';

export type Environment = 'development' | 'staging' | 'production' | string;

/**
 * @private
 * Replace variables name with their values from variable values.
 */
const replaceDynamicVars = (value: string): string | null => {
  const matchers = [...value.matchAll(/\$\{([^}]+)}/gm)];

  if (!matchers.length) {
    return null;
  }

  for (const [placeholder, name] of matchers) {
    const varValue = name in process.env
      ? process.env[name]
      : '';

    value = value.replace(placeholder, varValue);
  }

  return value;
};

/**
 * Retrieve a value from the process.env<br>
 * **Note**: Value containing template literals `${..}` or aliases `@..`
 * will get replaced by their *respected values*.
 * @param name - Variable name
 * @param [defaultValue] - Default value if not present
 *
 * @example Quick example
 * const value = getValue<string>('DATABASE_HOST');
 * console.log(value); // expected: undefined
 *
 * @example With a default value
 * const value = getValue<string>('DATABASE_HOST', 'localhost');
 * console.log(value); // expected: 'localhost'
 */
export function getValue<T>(name: Path, defaultValue: T): T {
  let value = obp.get<T>(process.env, name, defaultValue);

  if (typeof value === 'string') {
    const rendered = <T>replaceDynamicVars(value);
    if (rendered) value = rendered;
  }

  return <T>getAlias(value as string, false);
}

/**
 * Retrieve a boolean value from the process.env<br>
 * It will translate `empty`, `null`, `false` or `0` to false otherwise true.
 * @param name - Variable name
 * @param [defaultValue] - Default value if not present
 *
 * @example
 * const value = getBoolValue('ENABLE_LOGGING', false);
 * console.log(value); // expected: false
 *
 * @see getValue
 */
export function getBoolValue(name: Path, defaultValue: boolean = false): boolean {
  const value = getValue<string>(name, String(defaultValue)).trim();
  return !(!value || ['false', '0', 'null', ''].includes(value));
}

/**
 * Retrieve a number value from the process.env<br>
 * It will translate value into number.
 * @param name - Variable name
 * @param [defaultValue] - Default value if not present
 * @returns An integer or a float number
 * @example
 * const value = getNumberValue('PROFIT_RATIO', 60);
 * console.log(value); // expected: 60
 *
 * @see getValue
 */
export function getNumberValue(name: Path, defaultValue: number = 0): number {
  const value = Number(getValue<string>(name, String(defaultValue)).trim());
  return !value ? defaultValue : value;
}

/**
 * Retrieve an integer value from the process.env<br>
 * It will translate value into number.
 * @param name - Variable name
 * @param [defaultValue] - Default value if not present
 * @returns An integer number
 *
 * @example
 * const value = getIntValue('MAX_PROFIT_PER_YEAR', '60.60');
 * console.log(value); // expected: 60
 *
 * @see {@link getValue getValue()}
 */
export function getIntValue(name: Path, defaultValue: number = 0): number {
  const value = Number(parseInt(getValue<string>(name, String(defaultValue)).trim()));
  return !value ? defaultValue : value;
}

/**
 * Retrieve an array value from the process.env<br>
 * It will parse value using JSON.parse function.
 * @param name - Variable name
 * @param [defaultValue] - Default value if not present
 *
 * @example
 * const value = getArrayValue('ALLOWED_ORIGINS', ['localhost']);
 * console.log(value); // expected: ['localhost']
 *
 * @see getValue
 * @see JSON.parse
 */
export function getArrayValue<T>(name: Path, defaultValue: Array<T>): Array<T> {
  const value = getValue<string>(name, '[]').trim();

  if (!value) {
    return defaultValue;
  }

  try {
    const data = JSON.parse(value);
    return !Array.isArray(data) ? defaultValue : data;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Get current environment name
 */
export function environment(): string {
  return getValue<string>('NODE_ENV', 'development').trim();
}

/**
 * Match that the active environment is same as the provided one
 */
export function isEnvironment(env: Environment = 'development'): boolean {
  return environment() === env;
}

/**
 * Current environment is production or not
 */
export function isProdEnvironment(): boolean {
  return isEnvironment('production');
}
