/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import {dirname} from '../helpers/path';

// classes
import BaseJii from '../BaseJii';

/**
 * Initializes the core aliases
 * @param jii - Jii instance
 */
export default (jii: InstanceType<typeof BaseJii>) => {
  jii.setAlias('@jiiRoot', dirname(__filename, 2));
}
