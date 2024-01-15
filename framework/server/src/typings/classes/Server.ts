/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// types
import {ServerHTTPOptions} from '../server';
import {ComponentDefinition} from '@jii/core/dist/typings/components';

/**
 * Server configuration.
 */
export interface ServerComponentDefinition extends Omit<ComponentDefinition, 'class'> {
  /**
   * The server class.
   * @default "@jiiServer/classes/Server"
   */
  class?: string;

  /**
   * The address to bind server to.
   * @default 'localhost'
   */
  host?: string;

  /**
   * The port to start listen on
   * @default 8030
   */
  port?: number;

  /**
   * When true, the server will log all requests.
   * @default false
   */
  enableLogging?: boolean;

  /**
   * The options to pass to the server.
   * @see https://fastify.dev/docs/latest/Reference/Server/#factory
   */
  httpOptions?: ServerHTTPOptions;

  /**
   * When true routes are registered as case-sensitive. That is, `/foo` is not equal to `/Foo`. When `false` then routes are case-insensitive.
   *
   * <u>Please note</u> that setting this option to `false` goes against {@link https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.2.1 RFC3986}.
   * @default false
   */
  caseSensitive?: boolean;
}
