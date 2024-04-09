/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Application from '@jii/web/dist/classes/Application';

// utils
import {loadFile} from '@jii/core/dist/env';

// config files
import appConfig from '~/config/app';

loadFile('../.env');

(async () => {
  const config = await appConfig();
  await (new Application(config)).run();
})();
