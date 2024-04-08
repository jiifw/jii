/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Application from '../src/classes/Application';

// types
import {ApplicationConfig} from '../src/typings/app-config';

class MyApplication extends Application {
  /**
   * @inheritDoc
   */
  protected _platform = 'web';

  appendArguments(args: any[]): string[] {
    const collectedArgs = [];
    for (const argument of args) {
      if (typeof argument ==='string') {
        collectedArgs.push(argument);
      }
    }

    return args;
  }

  getUniqueId(): string {
    if (this._platform) {
      return `my-app-${this._platform}`;
    }

    const t = this.appendArguments([])

    return super.getUniqueId()
  }
}

const config: ApplicationConfig = {
  id: 'xyz-name',
  basePath: __dirname,
  plugins: {
    myPlugin: {
      path: '@jiiRoot/plugins/test-plugin',
      config: {foo: 'bar'} as any,
      components: {
        serverXys: {
          class: '@jiiRoot/classes/Component',
          enableLogging: false,
        },
      },
      [`on ${Application.EVENT_BEFORE_FINALIZE_CONFIG}`]: () => {
        // implement logic here
      },
    },
  },
};

(async () => {
  const app = new MyApplication(config);
  await app.run();
})();

/*
// file: plugins/test-plugin/index.ts

import Plugin from '../../classes/Plugin';
import {EventHandler} from '../../classes/Event';

export default class TestPlugin extends Plugin {
  events(): Record<string, EventHandler> {
    return {
      [Plugin.EVENT_BEFORE_APP_RUN]: 'beforeAppRun',
    };
  }

  public async beforeAppRun(evt) {
    //console.log(`Event '${Plugin.EVENT_BEFORE_APP_RUN}' triggered from`, this.constructor.name);
  }
}
*/
