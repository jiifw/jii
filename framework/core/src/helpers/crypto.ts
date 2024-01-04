/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import crypto from 'node:crypto';
import bcryptjs from 'bcryptjs';

/**
 * Generates a secure sha1 hash of value
 * @param str - Value to verify
 * @returns Generated hash string
 */
export const sha1 = (str: string): string => {
  const _sha1 = crypto.createHash('sha1');
  _sha1.update(str);
  return _sha1.digest('hex').toString();
};

/**
 * Generates a secure hash from a value and a random salt.
 * @param str - The value
 * @param [cost] - Cost length, more length more computation power
 * @returns Generated hash string
 */
export const generateHash = (str, cost: number = 11): string => {
  return bcryptjs.hashSync(str, bcryptjs.genSaltSync(cost));
};
