/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {dirname} from '@jii/core/dist/helpers/path';

// types
import {ApplicationConfig} from '@jii/web/dist/typings/app-config';

// plugin types
import {CorsPluginDefinition} from '@jii/cors/dist/types';
import {WizardPluginDefinition} from '@jii/wizard/dist/types';

/**
 * Application configuration.
 */
export default async (): Promise<ApplicationConfig> => {
  return ({
    id: 'jii-app',
    basePath: dirname(__dirname),
    params: require('./params')?.default ?? {},
    bootstrap: ['@app/bootstrap/bootstrap'],
    console: {
      dirs: [
        '@app/commands',
      ],
    },
    components: {
      server: {
        enableLogging: false,
        sessionOptions: {
          secret: 'c45445d8-f4ad-4687-890c-bb1eedce9a00'
        }
      },
    },
    plugins: {
      cors: <CorsPluginDefinition>{
        path: '@jii/cors',
      },
      wizard: <WizardPluginDefinition>{
        path: '@jii/wizard',

      },
    },
  });
};
