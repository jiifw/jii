// utils
import {applyMiddleware} from '@jii/server/dist/middleware';
import Jii from '@jii/core/dist/Jii';

/**
 * Server bootstrapper
 */
export default async (): Promise<void> => {
  Jii.container.memoSync('testing', () => new Map(), {freeze: true});
  //Jii.container.flush('testing')
  //Jii.container.setConfig('testing', {testing: 'xx'});
  //console.log('Jii', Jii.container);

  await applyMiddleware([
    /** Register plugins/middleware here */
    { path: '@jii/cors/dist', type: 'plugin' },
    //{ path: '@framework/plugins/swagger', type: 'plugin' },
    //{ path: '@framework/plugins/session', type: 'plugin' },
    //{ path: '@framework/plugins/access-token', type: 'plugin' },
    //{ path: '@framework/plugins/jwt', type: 'plugin' },
    //{ path: '@framework/plugins/i18n', type: 'plugin' },
    //{ path: '@framework/db/sequelize', type: 'plugin' },
  ]);

  //Jii.middleware.setAttr('cors', 'test', 'testing')

  //console.log('Jii.middleware:', Jii.middleware);
  //console.log('metadata():', Jii.middleware.metadata('cors'));
  //console.log('attributes():', Jii.middleware.attributes('cors'));
  //console.log('getAttr():', Jii.middleware.getAttr('cors', 'test'));
  //console.log('toName():', Jii.middleware.toName('cors'));
  //console.log('toId():', Jii.middleware.toId('@jii/cors/dist'));
}

