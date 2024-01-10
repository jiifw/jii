/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 */

/**
 * NotSupportedError represents an error caused by accessing features that are not supported.
 *
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */
export default class NotSupportedError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
