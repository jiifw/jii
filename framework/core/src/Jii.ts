/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import BaseJii from './BaseJii';

let Jii: InstanceType<typeof BaseJii>
export default Jii || (Jii = new (class extends BaseJii {}));
