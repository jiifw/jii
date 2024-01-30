/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {JSONSchema7} from 'json-schema';

export default <JSONSchema7>{
  type: 'object',
  additionalProperties: {
    type: 'object',
    properties: {
      class: {
        type: 'string',
        description: 'Class object or a path',
        minLength: 3,
      },
    },
    additionalProperties: true,
    patternProperties: {
      '^(on|as) [a-z]+([A-Z][a-z]+)*$': {},
      '^[a-z]+([A-Z][a-z]+)*$': {},
    },
    required: [
      'class',
    ],
  },
  propertyNames: {
    pattern: '^[a-z]+([A-Z0-9][a-z0-9]+)*$',
  },
};
