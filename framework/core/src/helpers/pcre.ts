/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

/**
 * Quote a string for use in a regular expression.
 * @param str - The input string.
 * @param delimiter - If the optional delimiter is specified, it will also be escaped. This is useful for escaping
 * the delimiter that is required by the PCRE functions. The / is the most commonly used delimiter.
 * @returns Returns the quoted (escaped) string.
 * @see https://locutus.io/php/pcre/preg_quote/
 * @see https://www.php.net/manual/en/function.preg-quote.php
 */
export const pregQuote = (str: string, delimiter: string = null): string => {
  const regx = new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g');
  return (str + '').replace(regx, '\\$&');
};

/**
 * Normalize a regular expression.
 * @param regex - The regular expression to normalize.
 * @param delimiter - If the optional delimiter is specified, it will also be escaped. This is useful for escaping
 * @returns Returns the normalized regular expression object
 */
const normalizePcre = (regex: string, delimiter: string = null): RegExp => {
  delimiter = delimiter || '/';

  if (!regex.startsWith(delimiter)) {
    return new RegExp(regex);
  }

  const _delimiter = pregQuote(delimiter, delimiter);
  const [, pattern, flags = null] = regex
    ?.match(new RegExp(`^${_delimiter}([^${_delimiter}]+)${_delimiter}(.+)?$`))
    ?.flat();
  return flags ? new RegExp(pattern, flags) : new RegExp(pattern);
};

/**
 * Perform a regular expression match
 * @param regex - The regular expression to match.
 * @param str - The string to match against.
 * @param [delimiter='/'] - If the optional delimiter is specified, it will also be escaped. This is useful for escaping
 * @returns Returns true if the string matches the regular expression, false otherwise.
 * @see https://www.php.net/manual/en/function.preg-match.php
 *
 * @example Quick example
 * pregMatch('^[a-z-]+$', 'Test'); // expected false
 * @example With flags and delimiter
 * pregMatch('/^[a-z-]+$/i', 'Test') // expected true
 * @example Custom delimiter
 * pregMatch('#^[a-z-]+$#', 'test', '#') // expected true
 */
export const pregMatch = (regex: string, str: string, delimiter = null): boolean => {
  return normalizePcre(regex, delimiter).test(str);
};
