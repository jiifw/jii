/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

export interface CommandOption {
  /** Option name (e.g., 'e') */
  flag: `-${string}, --${string}` | `--${string}`;

  /** Argument that commend accepts */
  argument?: string;

  /** A short description regarding your command option */
  description: string;

  /** Optional argument default value. */
  default?: string | boolean | string[];

  /** Show choices to related to the option */
  choices?: string[];

  /** Make option mandatory */
  required?: boolean;
}

export interface Argument {
  name: string;
  description?: string;
  defaultValue?: unknown;
}
