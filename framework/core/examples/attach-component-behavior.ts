/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Component from '../src/classes/Component';
import Behavior from '../src/classes/Behavior';
import Event from '../src/classes/Event';

class MyBehavior extends Behavior {
  public events() {
    return {[MyComponent.EVENT_BEFORE_VALIDATE]: 'beforeValidate'};
  }

  public beforeValidate(event: InstanceType<typeof MyEvent>) {
    event.isValid = false;
    event.sender.userId = 420;
    console.log(`Invoked ${this.constructor.name}.beforeValidate()`);
  }

  public toFieldName(name: string): string {
    return `field:${name}`;
  }
}

class MyEvent extends Event<MyComponent> {
  public isValid: boolean = true;
}

class MyComponent extends Component {
  public userId: number = 51254;
  static EVENT_BEFORE_VALIDATE = 'beforeValidate';

  public async beforeValidate() {
    const myEvent = new MyEvent();
    await this.trigger(MyComponent.EVENT_BEFORE_VALIDATE, myEvent);
    return myEvent.isValid;
  }
}

(async () => {
  const component = new MyComponent();
  const behavior = new MyBehavior();

  const handler = (/*event: Event*/) => {
    // event.data => {action: 'save'}
    console.log('Hello from EventHandler');
  };

  component.on('helloEvent', handler, {action: 'save'});
  component.on(MyComponent.EVENT_BEFORE_VALIDATE, async (/*event: Event*/) => {
    console.log('Again new event triggered');
  });

  component.attachBehavior('validator', behavior);

  console.log('Invoking method: beforeValidate();', await component.beforeValidate());
  console.log('Get object property value: userId', component.userId);

  console.log('invoke component object method:', await component.invoke('toFieldName', 'username'));
})();

