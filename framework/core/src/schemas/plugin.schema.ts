/**
 * Plugin schema
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {JSONSchema7} from 'json-schema';

// utils
import {PLUGIN_TYPES} from '../classes/Plugin';

export default <JSONSchema7>{
  type: 'object',
  additionalProperties: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        minLength: 3,
        maxLength: 250,
        title: 'Path',
        description: 'Path to plugin',
      },
      file: {
        type: 'string',
        title: 'File',
        description: 'File path to plugin',
        default: 'index',
      },
      version: {
        title: 'Version',
        description: 'Plugin version (semver)',
        type: 'string',
        pattern: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
        default: 'index',
      },
      alias: {
        type: 'string',
        minLength: 3,
        maxLength: 50,
        pattern: '^[a-z]+([A-Z][a-z]+)*$',
        title: 'Alias',
        description: 'Alias for the plugin',
        default: '',
      },
      type: {
        type: 'string',
        pattern: '^[a-z]+$',
        enum: PLUGIN_TYPES as any,
        default: 'none',
        title: 'Type',
        description: 'Type of plugin',
      },
      disabled: {
        type: 'boolean',
        default: false,
      },
      commands: {
        type: 'boolean',
        default: true,
      },
      config: {
        type: 'object',
        additionalProperties: true,
      },
      components: {
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
      },
    },
    additionalProperties: false,
    patternProperties: {
      '^(on|as) [a-z]+([A-Z][a-z]+)*$': {},
      '^[a-z]+([A-Z][a-z]+)*$': {},
    },
    required: [
      'path',
    ],
  },
  propertyNames: {
    title: 'Plugin ID',
    pattern: '^[a-z]+([A-Z][a-z]+)*$',
  },
};
