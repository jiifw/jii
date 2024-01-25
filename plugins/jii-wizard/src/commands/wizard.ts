/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import PromptCommand from '@jii/console/dist/classes/PromptCommand';

// utils
import {dirname} from '@jii/core/dist/helpers/path';

// 'wizard' command
export default class Wizard extends PromptCommand {
  /**
   * @inheritDoc
   */
  public name: string = 'wizard';

  /**
   * @inheritDoc
   */
  public description: string = 'Generates jii code based on a schematic.';

  /**
   * @inheritDoc
   */
  public basePath: string = dirname(__dirname);

  /**
   * @inheritDoc
   */
  public directory: string = 'generators/wizard';
}
