/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 */

/**
 * UnknownClassError represents an error caused by using an unknown class.
 *
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */
export default class UnknownClassError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
