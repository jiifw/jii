/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// types
import {ServerComponentDefinition} from './classes/Server';
import {RequestComponentDefinition} from './classes/Request';
import {ResponseComponentDefinition} from './classes/Response';
import {AccessTokenComponentDefinition} from './classes/AccessToken';
import {ApplicationConfig as IAppConfig, ComponentsDefinition} from '@jii/core/dist/typings/app-config';

export interface ApplicationConfig extends IAppConfig {
  components?: ComponentsDefinition & {
    /**
     * Server component configuration.
     */
    server?: ServerComponentDefinition;

    /**
     * Request component configuration.
     */
    request?: RequestComponentDefinition;

    /**
     * Response component configuration.
     */
    response?: ResponseComponentDefinition;

    /**
     * Access token component configuration.
     */
    accessToken?: AccessTokenComponentDefinition;
  };
}
