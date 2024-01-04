import {loadFile} from '@jii/core/dist/env';
import Application from '@jii/server/dist/web/Application';
import appConfig from './config/app';

loadFile('../.env');

(async () => {
  const config = await appConfig();
  await (new Application(config)).run();
})();
