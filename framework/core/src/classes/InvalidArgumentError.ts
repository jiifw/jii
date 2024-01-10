/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 */

/**
 * InvalidArgumentError represents an error caused by invalid arguments passed to a method.
 *
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */
export default class InvalidArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
