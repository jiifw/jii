/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

export default class Logger {
  /**
   * Logs an error message.
   * An error message is typically logged when an unrecoverable error occurs
   * during the execution of an application.
   */
  error(msg: string, ...args: any[]) {
    console.error(msg, ...args);
  }

  /**
   * Logs a debug message.
   * Trace messages are logged mainly for development purposes to see
   * the execution workflow of some code. This method will only log
   * a message when the applicati-on is in debug mode.
   */
  debug(msg: string, ...args: any[]) {
    console.debug(msg, ...args);
  }

  /**
   * Logs a warning message.
   * A warning message is typically logged when an error occurs while the execution
   * can still continue.
   */
  warn(msg: string, ...args: any[]) {
    console.warn(msg, ...args);
  }

  /**
   * Alias of {@link debug}.
   */
  trace(msg: string, ...args: any[]) {
    console.trace(msg, ...args);
  }

  /**
   * Logs an informative message.
   * An informative message is typically logged by an application to keep record of
   * something important (e.g. an administrator logs in).
   */
  info(msg: string, ...args: any[]) {
    console.info(msg, ...args);
  }
}
