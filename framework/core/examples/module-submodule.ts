/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import Module from '../src/classes/Module';
import Jii from '../src/Jii';

class WebModule extends Module {
}

const webMod = new WebModule('web');
console.log('Module.getUniqueId():', webMod.getUniqueId());
console.log('Module.getBasePath():', webMod.getBasePath());
webMod.setBasePath(__dirname);
webMod.setBasePath('@jiiRoot/../examples');
console.log('[changed] Module.getBasePath():', webMod.getBasePath());
console.log('Module.getVersion():', webMod.getVersion());
webMod.setVersion('2.0');
console.log('Module.getVersion():', webMod.getVersion());

webMod.setVersion(() => '2.1.4');
console.log('Module.getVersion():', webMod.getVersion());
webMod.setAliases({'@classes': '@jiiRoot/classes'});
console.log('Jii.aliases:', Jii.aliases);

// submodules
console.log('[submodule] Module.hasModule():', webMod.hasModule('test'));
webMod.setModule('test', new Module('test'));
console.log('[submodule] Module.module.getUniqueId():', webMod.getModule('test').getUniqueId());
/*console.log('Module.module.getModules():', webMod.getModule('test').getUniqueId());*/

console.log('Module.getModules():', webMod.getModules());
console.log('Module.getModules() [loadedOnly]:', webMod.getModules(true));
console.log('Module.get()', webMod.has('test'));
