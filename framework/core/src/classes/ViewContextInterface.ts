/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

/**
 * ViewContextInterface is the interface that should implement by classes who want to support relative view names.
 *
 * The method {@link getViewPath getViewPath()} should be implemented to return the view path that may be prefixed to a relative view name.
 */
export interface ViewContextInterface {
  /**
   * The view path that may be prefixed to a relative view name.
   */
  getViewPath(): string;
}
