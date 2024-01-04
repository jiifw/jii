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
  properties: {
    id: {
      type: 'string',
      maxLength: 50,
      pattern: '^[a-z]+(-[a-z0-9]+)*$',
    },
    basePath: {
      type: 'string',
      maxLength: 50,
    },
    bootstrap: {
      oneOf: [
        {
          type: 'string',
        },
        {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      ],
    },
    aliases: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      propertyNames: {
        pattern: '^[a-z]+([A-Z][a-z]+)*$',
      },
    },
    params: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      propertyNames: {
        pattern: '^[a-z]+([A-Z][a-z]+)*$',
      },
    },
    server: {
      type: 'object',
      properties: {
        httpOptions: {
          type: 'object',
          additionalProperties: true,
          propertyNames: {
            pattern: '^[a-z]+([A-Z][a-z]+)*$',
          },
        },
      },
    },
    middleware: {
      type: 'array',
      items: {
        type: 'object',
        anyOf: [
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [
                  'middleware',
                ],
              },
              description: {
                type: 'string',
              },
              path: {
                type: 'string',
              },
              config: {
                type: 'object',
                additionalProperties: true,
                propertyNames: {
                  pattern: '^[a-z]+([A-Z][a-z]+)*$',
                },
              },
            },
            required: [
              'type',
              'path',
            ],
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [
                  'plugin',
                ],
              },
              description: {
                type: 'string',
              },
              path: {
                type: 'string',
              },
              config: {
                type: 'object',
                additionalProperties: true,
                propertyNames: {
                  pattern: '^[a-z]+([A-Z][a-z]+)*$',
                },
              },
            },
            required: [
              'type',
              'path',
            ],
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [
                  'register',
                ],
              },
              description: {
                type: 'string',
              },
              path: {
                type: 'string',
              },
              config: {
                type: 'object',
                additionalProperties: true,
                propertyNames: {
                  pattern: '^[a-z]+([A-Z][a-z]+)*$',
                },
              },
            },
            required: [
              'type',
              'path',
            ],
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [
                  'after',
                ],
              },
              description: {
                type: 'string',
              },
              handler: {
                type: 'object',
                additionalProperties: false,
              },
            },
            required: [
              'type', 'handler',
            ],
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [
                  'plugin',
                ],
              },
              description: {
                type: 'string',
              },
              config: {
                type: 'object',
                additionalProperties: true,
                propertyNames: {
                  pattern: '^[a-z]+([A-Z][a-z]+)*$',
                },
              },
            },
            required: [
              'type',
            ],
          },
        ],
      },
    },
  },
  required: [
    'id',
    'basePath',
  ],
};
