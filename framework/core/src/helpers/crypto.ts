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
 * Generates md5 hash of value
 * @param str - Value to verify
 * @returns Generated hash string
 */
export const md5 = (str: string): string => {
  return crypto.createHash('md5').update(str).digest('hex').toString();
};

/**
 * Generates a secure sha1 hash of value
 * @param str - Value to verify
 * @returns Generated hash string
 */
export const sha1 = (str: string): string => {
  return crypto.createHash('sha1').update(str).digest('hex').toString();
};

/**
 * Generates a secure sha256 hash of value
 * @param str - Value to verify
 * @returns Generated hash string
 */
export const sha256 = (str: string): string => {
  return crypto.createHash('sha256').update(str).digest('hex').toString();
};

/**
 * Generates a secure sha512 hash of value
 * @param str - Value to verify
 * @returns Generated hash string
 */
export const sha512 = (str: string): string => {
  return crypto.createHash('sha512').update(str).digest('hex').toString();
};

/**
 * Generates a secure shake256 hash of value
 * @param str - Value to verify
 * @param [length] - Maximum length of hash string
 * @returns Generated hash string
 */
export const shake256 = (str: string, length: number = 11): string => {
  return crypto.createHash('shake256', {outputLength: length}).update(str).digest('hex').toString();
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
