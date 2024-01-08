/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import Component from '../../src/classes/Component';
import Event from '../../src/classes/Event';

describe('class Component', () => {
  let instance;

  beforeEach(() => {
    instance = new Component();
  });

  it('Initializing component without properties', async () => {
    const instance = new Component();
    expect(instance).toBeInstanceOf(Component);
  });

  it('Initializing component with property', async () => {
    const instance = new Component({event: 'click'});
    expect(instance).toBeInstanceOf(Component);
    expect(instance.hasProperty('event')).toBe(true);
  });
});

describe('Component events', () => {
  it('Register, verify, trigger and removing component event', async () => {
    const instance = new Component();
    const handleClick = () => 'output';

    instance.on('handleClick', handleClick);
    expect(instance.hasEventHandlers('handleClick')).toBe(true);

    const output = await instance.trigger('handleClick');
    expect(output).toBe(undefined);

    instance.off('handleClick', handleClick);
    expect(instance.hasEventHandlers('handleClick')).toBe(false);
  });

  it('Testing event callback along with the event data', async () => {
    const instance = new Component({event: 'click'});

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
