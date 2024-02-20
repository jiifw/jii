/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import UserError from '@jii/core/dist/classes/UserError';

/**
 * HttpException represents an exception caused by an improper request of the end-user.
 *
 * HttpException can be differentiated via its {@link statusCode} property value which
 * keeps a standard HTTP status code (e.g. 404, 500). Error handlers may use this status code
 * to decide how to format the error page.
 *
 * Throwing an HttpException like in the following example will result in the 404 page to be displayed.
 *
 * ```
 * if (item === null) { // item does not exist
 *     throw new HttpError(404, 'The requested Item could not be found.');
 * }
 * ```
 */
export default class HttpError extends UserError {
  /**
   * HTTP status code, such as 403, 404, 500, etc.
   */
  public statusCode: number = null;

  /**
   * Constructor.
   * @param status - HTTP status code, such as 404, 500, etc.
   * @param message - Error message
   */
  public constructor(status: number, message: string = null) {
    super(message);
    this.statusCode = status;
  }

  /**
   * The user-friendly name of this exception
   */
  public getName(): string {
    /*if (isset(Response::$httpStatuses[$this->statusCode])) {
      return Response::$httpStatuses[$this->statusCode];
    }*/

    return 'Error';
  }
}
