/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 */

/**
 * InvalidCallError represents an error caused by calling a method in a wrong way.
 *
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */
export default class InvalidCallError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
