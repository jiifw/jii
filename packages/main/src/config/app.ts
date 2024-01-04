import {dirname} from '@jii/core/dist/helpers/path';

// types
import {ApplicationConfig} from '@jii/server/dist/typings/app';

export default async (): Promise<ApplicationConfig> => ({
  id: 'jii-app',
  basePath: dirname(__dirname),
  params: {
    test: 'value',
  },
  aliases: {
    classed: 'x'
  },
  bootstrap: ['@app/bootstrap/bootstrap'],
  server: {
    httpOptions: {
    }
  }
});
