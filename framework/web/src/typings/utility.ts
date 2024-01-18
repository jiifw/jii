/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

/**
 * Rename type keys
 *
 * @example
 * type Props = { name?: string; age?: number; visible?: boolean; };
 *
 * // expected: { label?: string; age?: number; visible?: boolean; };
 * const Props = RenameByT<{
 *   name: 'label',
 * }, Props>
 *
 */
export type RenameByT<T, U> = {
  [K in keyof U as K extends keyof T
    ? T[K] extends string
      ? T[K]
      : never
    : K]: K extends keyof U ? U[K] : never;
};

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

/**
 * XOR is needed to have a real mutually exclusive union type
 * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
 */
export type XOR<T, U> =
  T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
      : U : T

/**
 * Generic constructor type
 */
export type Constructor = new (...args: any[]) => any;
