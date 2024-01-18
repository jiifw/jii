/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// types
import { PluginMetadata } from 'fastify-plugin';
import { ServerInstance } from './server';

export namespace plugin {
  export interface Info {
    id: Lowercase<string>;
    name: Lowercase<string>;
    metadata?: Omit<PluginMetadata, 'name'>;
  }

  /** Plugin configuration get to store/retrieve from registry */
  export type ConfigKey = string;

  export type Handler = (
    server: ServerInstance, options: Record<string, any>,
  ) => Promise<void>;

  export interface Definition {
    info: Info;
    handler: Handler;
  }
}
