/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {ComponentDefinition} from '@jii/core/dist/typings/components';

export interface RequestComponentDefinition extends Omit<ComponentDefinition, 'class'> {
  /**
   * The request class.
   * @default "@jiiServer/classes/Request"
   */
  class?: string;
}
