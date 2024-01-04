/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

const obPath = require('object-path');
const merge = require('deepmerge');
import Ajv, {InstanceOptions as AjvInstanceOptions, ValidateFunction} from 'ajv';
import AjvI18N from 'ajv-i18n';
import AjvKeywords from 'ajv-keywords';
import AjvAddFormats, {FormatsPluginOptions} from 'ajv-formats';
import AjvErrors, {ErrorMessageOptions} from 'ajv-errors';

// types
import {DeepPartial} from 'utility-types';

export interface InstanceOptions {
  /** Ajv options */
  ajv: AjvInstanceOptions;
  /** Ajv keywords options */
  keywords: string | string[] | null;
  /** Ajv format plugin options */
  formatsOptions: FormatsPluginOptions;
  /** Ajv format plugin options */
  errorOptions: ErrorMessageOptions;
}

export type Instance = InstanceType<typeof Ajv>;

/**
 * Returns a new Ajv instance<br>
 * Special replaceable variables in `errorMessage`:
 * <ul>
 *   <li><b>'$t$'</b>: Replace by title's property value</li>
 *   <li><b>'$vv$'</b>: Replace by validation rule's value</li>
 * </ul>
 * @param [options] - Additional options
 * @returns Ajv instance
 * @example
 * // Basic example
 * const validate = newInstance()
 * .addKeyword({
 *   keyword: 'minLengthOpt',
 *   type: 'number',
 *   validate: ( schema, data ) =>
 *     !data ? true : !(String(data).length < schema),
 * })
 * .compile({
 *     title: 'Caption',
 *     type: 'string',
 *     minLengthOpt: 5,
 *     maxLength: 30,
 *     errorMessage: {
 *       minLengthOpt: request.t(`$t$ length should be greater than $vv$`, 5),
 *     }
 * });
 *
 * if ( !validate(data) ) {
 *   const {message} = parseError(validate, request);
 *   return new Error(message);
 * }
 */

export const newInstance = (options: DeepPartial<InstanceOptions> = {}): Instance => {
  const _options: InstanceOptions = merge(<InstanceOptions>{
    ajv: {
      verbose: true,
      allErrors: true,
      $data: true,
    },
    formatsOptions: {},
    errorOptions: {singleError: true},
  }, options);

  const ajv = new Ajv(_options.ajv);

  AjvKeywords(ajv, options.keywords || null);
  AjvAddFormats(ajv, options.formatsOptions);
  AjvErrors(ajv, options.errorOptions);

  return ajv;
};

/**
 * Get i18n/formatted error messages from `ajv` validation errors<br>
 * Special replaceable variables:
 * <ul>
 *   <li><b>'$t$'</b>: Replace by title's property value</li>
 *   <li><b>'$vv$'</b>: Replace by validation rule's value</li>
 * </ul>
 * @param {validate} validate - Validate function
 * @param [lang='en'] - Language
 * @returns Error message / Nothing
 * @example Simple error
 * if ( !validate(data) ) {
 *   const {message} = parseError(validate);
 *   throw new Error(message);
 * }
 */
export const parseError = (validate: ValidateFunction, lang: string = 'en'): { message: string, key: string } | null => {
  if (!validate || !('errors' in validate) || !validate?.errors?.length) {
    return null;
  }

  if (lang in AjvI18N) {
    AjvI18N[lang](validate.errors[0]);
  }

  const {keyword, instancePath, message, parentSchema} = obPath.get(validate, 'errors.0');

  const key = String(instancePath).replace(/^\//, '');

  /** @type {string} */
  let errorMessage = obPath.get(parentSchema, `errorMessage.${keyword}`, `${key} ${message}`);

  // eslint-disable-next-line no-useless-escape
  errorMessage = errorMessage.replace(/\{t}/g, key)
    .replace(/\{v}/g, parentSchema[keyword] || '');

  if (errorMessage.match(new RegExp(`${key} `, 'g')).length > 1) {
    errorMessage = errorMessage.replace(new RegExp(`${key} `, ''), '');
  }

  return {
    message: errorMessage,
    key,
  };
};
