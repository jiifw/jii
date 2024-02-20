/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import HttpError from './HttpError';

/**
 * NotFoundHttpException represents a "Not Found" HTTP exception with status code 404.
 */
export default class NotFoundHttpError extends HttpError {
  /**
   * Constructor.
   * @param message - Error message
   */
  public constructor(message: string = null) {
    super(404, message);
  }
}
