/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Component from './Component';
import {Module} from './Module';

// utils
import {ltrim} from '../helpers/string';

export default class Controller extends Component {
  /**
   * An ID that uniquely identifies this module among other modules which have the same {@link module}.
   */
  public id: string;

  /**
   * The parent module of this module. `null` if this module does not have a parent.
   */
  public module: Module | null = null;

  /**
   * Returns an ID that uniquely identifies this module among all modules within the current application.
   * Note that if the module is an application, an empty string will be returned.
   * @return The unique ID of the module.
   */
  public getUniqueId(): string {
    return this.module
      ? ltrim(this.module.getUniqueId() + '/' + this.id, '/')
      : this.id;
  }
}
