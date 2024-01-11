/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import Component from '../../src/classes/Component';
import Event from '../../src/classes/Event';

class User extends Component {
}

describe('Initializing component', () => {
  let instance;

  beforeEach(() => {
    instance = new User;
  });

  it('Initializing component without properties', async () => {
    const instance = new User();
    expect(instance).toBeInstanceOf(User);
  });

  it('Initializing component with property', async () => {
    const instance = new User({event: 'click'});
    expect(instance).toBeInstanceOf(User);
    expect(instance.hasProperty('event')).toBe(true);
  });
});

describe('Component events', () => {
  it('Register, verify, trigger and removing component event', async () => {
    const instance = new User();
    const handleClick = jest.fn(() => 'output');

    instance.on('handleClick', handleClick);
    expect(instance.hasEventHandlers('handleClick')).toBe(true);

    const output = await instance.trigger('handleClick');
    expect(output).toBe(undefined);

    instance.off('handleClick', handleClick);
    expect(instance.hasEventHandlers('handleClick')).toBe(false);
  });

  it('Testing event callback along with the event data', async () => {
    const instance = new User({event: 'click'});

    const handleClick = jest.fn((event: Event) => {
      event.data.action ='submit';
    });

    const data = {action: 'submit'};

    /*instance.on('handleClick', handleClick, data);
    expect(instance.hasEventHandlers('handleClick')).toBe(true);

    const output = await instance.trigger('handleClick');
    expect(output).toBe(undefined);

    instance.off('handleClick', handleClick);
    expect(instance.hasEventHandlers('handleClick')).toBe(false);*/
  });
});
