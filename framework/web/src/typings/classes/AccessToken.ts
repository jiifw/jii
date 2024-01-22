/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {ComponentDefinition} from '@jii/core/dist/typings/components';

export type TokenOption = {
  [key: string]: any;
  name: string;
}

export type TokenHeaderOption = {
  [key: string]: any;
  header: string;
}

export type TokenBearerOption = {
  [key: string]: any;
  scheme: string;
}

export type TokenAllOption = TokenOption
  & TokenHeaderOption
  & TokenBearerOption & { [key: string]: any; }

export interface AccessTokenComponentDefinition extends Omit<ComponentDefinition, 'class'> {
  /**
   * Token field name to retrieve from
   * @default 'access_token'
   */
  field?: string;

  /**
   * Token header name to retrieve from
   * @default 'x-access-token'
   */
  headerName?: string;

  /**
   * Token authorization 'schema' name
   * @default 'Bearer'
   */
  scheme?: string;
}
