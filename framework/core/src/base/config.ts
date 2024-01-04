/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import merge from 'deepmerge';
import obp, { Path } from 'object-path';

// utils
import { exists, importFile } from '../helpers/file';

type ServerInstance = {}

/** Memorize configuration registry */
const pluginConfig = new Map<string | symbol, any>();

/**
 * Import a configuration file (.ts | .js)
 * @param alias - Alias including filename (ext: .js | .ts)
 * @param defaultConfig - Default configuration file
 * @param server - Server instance
 */
export async function importConfigFile<T>(alias: string, defaultConfig: T, server?: ServerInstance): Promise<T> {
  if (!exists(alias)) {
    return defaultConfig;
  }

  const { default: configFetch } = await importFile(alias);
  return merge(defaultConfig, await configFetch(server));
}

/**
 * Import an app based plugin configuration file (.ts)
 * @param id - Plugin id
 * @param server - Server instance
 * @param [defaultConfig] - Default configuration file
 */
export async function importPluginConfig<T>(id: string, server?: ServerInstance, defaultConfig?: T): Promise<T> {
  return importConfigFile<T>(
    `@app/config/${id}.plugin.ts`, defaultConfig, server,
  );
}

/**
 * Memorize configuration to the memory
 * @param id - Plugin id
 * @param config - data to store
 */
export function memorize<T extends Record<string, any>>(id: string, config: T): void {
  pluginConfig.set(Symbol(id), config);
}

/**
 * Get memorized configuration by id
 */
export function retrieve<T>(id: string, path: Path = null, defaultValue = null): T | null {
  const config = pluginConfig.has(Symbol(id))
    ? pluginConfig.get(Symbol(id))
    : {};

  return <T>(path
    ? obp.get(config, path, defaultValue)
    : config);
}
