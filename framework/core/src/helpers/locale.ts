/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import locale from 'locale-code';

/**
 * Check that given local code is valid or not (aa-BB)
 * @param language - The language code *(e.g., 'ur-PK', 'en-GB')*
 * @returns True when valid / False otherwise
 *
 * @example
 * console.log(validateLanguage('ur-PK')); // true
 * console.log(validateLanguage('en')); // false
 * console.log(validateLanguage('fo-BR')); // false
 */
export const isLanguage = ( language: string ): boolean => locale.validateLanguageCode(language);
