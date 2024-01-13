/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {EventHandler} from '../classes/Event';
import {BehaviorArgs} from '../classes/Behavior';

export interface ComponentsDefinition {
  /** Component alias to retrieve via Jii::get('<alias>') throughout the application */
  [key: string]: {
    /** Class path, Object */
    class: string;
    [event: `on ${string}`]: EventHandler;
    [behavior: `as ${string}`]: BehaviorArgs;
    [prop: string]: any;
  };
}
