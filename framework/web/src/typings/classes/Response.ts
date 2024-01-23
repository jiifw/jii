/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {ComponentDefinition} from '@jii/core/dist/typings/components';

export interface ResponseComponentDefinition extends Omit<ComponentDefinition, 'class'> {
  /**
   * The response class.
   * @default "@jiiServer/classes/Response"
   */
  class?: string;
}
