/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import { parse } from 'node:url';

// utils
import { getArrayValue } from '@jii/core/dist/env';

/**
 * Get origin from request
 * @param origin - Request origin
 * @returns true if request is from allowed origin or false if not
 */
export const getOrigin = (origin: string): boolean => {
  // Set true when non-browser request
  if (!origin) {
    return true;
  }

  const { hostname } = parse(origin, false);

  /** Whitelist origins (domains only) */
  const wlOrigins = getArrayValue<string>('SERVER_CORS_ORIGINS', ['localhost']);

  for (const wlOrigin of wlOrigins) {
    if (wlOrigin.includes(hostname)) {
      return true;
    }
  }

  return false;
};
