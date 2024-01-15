/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {dirname} from '@jii/core/dist/helpers/path';

// types
import {ApplicationConfig} from '@jii/server/dist/typings/app-config';

/**
 * Application configuration.
 */
export default async (): Promise<ApplicationConfig> => ({
  id: 'jii-app',
  basePath: dirname(__dirname),
  params: {
    test: 'value',
  },
  aliases: {
    classed: 'x',
  },
  bootstrap: ['@app/bootstrap/bootstrap'],
  components: {
    server: {
      enableLogging: false,
    },
  },
});
