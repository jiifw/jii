/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {normalize} from 'node:path';

// classes
import ConfigValidator from '../../classes/ConfigValidator';
import InvalidConfigError from '../../classes/InvalidConfigError';

// utils
import Jii from '../../Jii';
import {isPath} from '../../helpers/path';
import {toString} from '../../helpers/string';
import {isLanguage} from '../../helpers/locale';
import {isTimezone} from '../../helpers/datetime';

// types
import {Schema, PropertyPath} from '../../classes/ConfigValidator';

/**
 * Validate and apply the core configuration properties to the application
 */
export default class CoreConfigValidator extends ConfigValidator {
  /**
   * @inheritDoc
   */
  public propertyName(): PropertyPath | PropertyPath[] {
    return [
      'id',
      'name',
      'basePath',
      'sourceLanguage',
      'language',
      'timeZone',
    ];
  }

  /**
   * @inheritDoc
   */
  async getSchema(): Promise<Schema> {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          maxLength: 50,
          pattern: '^[a-z]+(-[a-z0-9]+)*$',
        },
        name: {
          type: 'string',
          maxLength: 30,
        },
        basePath: {
          type: 'string',
          maxLength: 200,
        },
        sourceLanguage: {
          type: 'string',
          minLength: 4,
          maxLength: 6,
        },
        language: {
          type: 'string',
          minLength: 4,
          maxLength: 6,
        },
        timeZone: {
          type: 'string',
          minLength: 3,
          maxLength: 10,
        },
      },
      required: [
        'id',
        'basePath',
      ],
    };
  }

  /**
   * @inheritDoc
   */
  async validate(): Promise<void> {
    if (!isPath(this.getConfig()?.basePath, 'dir')) {
      throw new InvalidConfigError(`Application's 'basePath' must be a valid directory`);
    }

    if (this.getConfig()?.language && !isLanguage(this.getConfig().language)) {
      throw new InvalidConfigError(`Application's 'language' must be a part of ISO 639`);
    }

    if (this.getConfig()?.sourceLanguage && !isLanguage(this.getConfig().sourceLanguage)) {
      throw new InvalidConfigError(`Application's 'sourceLanguage' must be a part of ISO 639`);
    }

    if (this.getConfig()?.timeZone && !isTimezone(this.getConfig().timeZone)) {
      throw new InvalidConfigError(`Application's 'timeZone' must be a valid time zone`);
    }
  }

  /**
   * @inheritDoc
   */
  async apply(app): Promise<void> {
    const config = this.getConfig();

    Jii.setAlias('@app', normalize(config.basePath), true);

    app.id = config.id;
    delete config.id;

    if (toString(config?.name, true)) {
      app.name = config.name;
      delete config.name;
    }

    if (toString(config?.language, true)) {
      app.language = config.language;
      delete config.language;
    }

    if (toString(config?.sourceLanguage, true)) {
      app.sourceLanguage = config.sourceLanguage;
      delete config.sourceLanguage;
    }

    if (toString(config?.timeZone, true)) {
      app.timeZone = config.timeZone;
      delete config.timeZone;
    }

    app.setBasePath(config.basePath);

    this.setConfig(config);
  }
}
