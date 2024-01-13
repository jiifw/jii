/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import ServiceLocator from '../src/classes/ServiceLocator';
import Component from '../src/classes/Component';

class FileCache extends Component {
  public dirPath: string = null;
}

const locator = new ServiceLocator;
locator.set('cache', {class: FileCache, dirPath: '@app/cache'});

const cache = locator.get<FileCache>('cache');
cache.setProperty('dirPath', '@app/runtime/cache');

console.log('Has undefined component?:', locator.has('undefined'));
console.log('Has "cache" component?:', locator.has('cache'));

locator.setComponents({
  fileCache: {class: FileCache},
  myComponent: {class: '@jiiRoot/classes/Component'},
});

console.log('Get all components:', locator.getComponents());
console.log('Get all definitions:', locator.getComponents(true));

// clear components
locator.clear('cache');

