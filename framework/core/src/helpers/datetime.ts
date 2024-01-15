/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import momentTz from 'moment-timezone';

/**
 * Checks that timezone is valid or not
 * @param timezone - The timezone to check
 * @returns True if timezone is valid, false otherwise
 *
 * @example
 * console.log(isTimezone('Asia/Karachi')); // true
 * console.log(isTimezone('UTC')); // true
 * console.log(isTimezone('Foo/Bar')); // false
 */
export const isTimezone = (timezone: string): boolean => {
  return momentTz.tz.zone(timezone) !== null;
};
