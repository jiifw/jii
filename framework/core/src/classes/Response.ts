/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Component from './Component';

/**
 * The web Response class represents an HTTP response.
 *
 * Response is configured as an application component in {@link Application} by default.
 * You can access that instance via `Jii.app().get<Response>('response')`.
 *
 */
export default class Response extends Component {
  /**
   * Returns the header collection.
   * The header collection contains the currently registered HTTP headers.
   * @returns The header collection
   */
  public getHeaders(): Record<string, string> {
    return {};
  }

  /**
   * @return Whether this response indicates the currently requested resource is not found
   */
  public getIsNotFound(): boolean {
    return false;
  }

  /**
   * @return Whether this response is empty
   */
  public getIsEmpty(): boolean {
    return false;
  }
}
