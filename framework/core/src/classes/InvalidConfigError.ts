/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 */

/**
 * InvalidConfigError represents an error caused by incorrect object configuration.
 *
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */
export default class InvalidConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
