/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import Jii from '../src/Jii';

// classes
import Component from '../src/classes/Component';
import Behavior from '../src/classes/Behavior';
import Event from '../src/classes/Event';

class MyComponent extends Component {
  static EVENT_TEST = 'testEvent';
  action: string = 'test';
}

class MyEvent extends Event {
}

class MyBehavior extends Behavior {
}

console.info('Instance from anonymous function returns class', Jii.createObject(() => MyComponent));

console.info('Instance from anonymous function returns instance', Jii.createObject(() => new MyComponent()));

console.info('Instance from class', Jii.createObject(MyComponent));

console.info('Instance from path', Jii.createObject('@jiiRoot/Comp'));

console.info('Instance from path', Jii.createObject('@jiiRoot/Comp'));

console.info('Instance from config [class: Class]', Jii.createObject({
  class: MyComponent,
}));

console.info('Instance from config [class: Path]', Jii.createObject({
  class: '@jiiRoot/Comp',
}));

const myComponent = Jii.createObject<MyComponent>({
  class: MyComponent,
  action: 'stuck',
  working: 'YES',
  'as testing': MyBehavior,
  'on myEvent': (event: MyEvent): void => {
    (event.sender as MyComponent).setProperty('action', 'resume');
    //console.log('myEvent TRIGGERED');
  },
});

(async () => {
  console.log('[TRACE]:  Property "action" [before] event:', myComponent.action); // stuck

  const event = new MyEvent();
  event.sender = myComponent;
  await myComponent.trigger('myEvent', event);

  console.log('[VERIFY]: Property "action" is changed to resume?', myComponent.getProperty('action') === 'resume'); // true
  console.log('[TRACE]:  Property "action" [after] event:', myComponent.getProperty('action')); // resume
})();
