/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 */

/**
 * UserError is the base class for errors that are meant to be shown to end users.
 * Such errors are often caused by mistakes of end users.
 *
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */
export default class UserError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
