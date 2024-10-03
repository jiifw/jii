/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// types
import {Class} from 'utility-types';
import {EventHandler} from '~/classes/Event';
import {BehaviorArgs} from '~/classes/Behavior';
import {ComponentsDefinition} from './components';

export interface ModuleDefinition {
  /** Module class path, Object */
  class?: string | Class<any>;
  /** Module events */
  [event: `on ${string}`]: EventHandler;
  /** Module behavior */
  [behavior: `as ${string}`]: BehaviorArgs;
  /** Additional property behavior */
  [prop: string]: any;

  /**
   * Additional parameters to store with the application to access later<br>
   * To access in later application, use: `Jii.instance().params['secret'];`
   * @example
   * {
   *   'db': {server: 'localhost', ...},
   *   'secret': '<random-hash-here>',
   * }
   * @default undefined
   */
  params?: Record<string, any>;

  /**
   * Components to register with the application<br>
   *
   * @example
   * components: {
   *   webDisk: {
   *     class: MyComponent,
   *     'as changeProp': new Behavior,
   *     'on myEvent': () => { console.log('myEvent TRIGGERED'); },
   *     action: 'changed',
   *     working: 'YES'
   *   },
   *   ... // others
   * }
   *
   * @default {}
   */
  components?: ComponentsDefinition;
}

export interface ModulesDefinition {
  /** Retrieve module via Jii::app()->getModule('<id>') throughout the application */
  [key: string]: ModuleDefinition;
}
