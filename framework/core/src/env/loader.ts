/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import * as dotenv from 'dotenv';

/**
 * Load variables into memory, can be accessed by `process.env` later
 * @param config - Environment variables
 */
export const load = (config: Record<string, any>): void => {
  for (const [key, value] of Object.entries(config)) {
    process.env[key] = value;
  }
};

/**
 * Load the given .env file into memory (process environment variables)
 * @param path - Absolute path to .env file
 */
export const loadFile = (path: string): void => {
  dotenv.config({ path });
};
