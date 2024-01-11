/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import BaseObject from '../../src/classes/BaseObject';
import UnknownPropertyError from '../../src/classes/UnknownPropertyError';
import InvalidScopeError from '../../src/classes/InvalidScopeError';
import InvalidCallError from '../../src/classes/InvalidCallError';
import InvalidArgumentError from '../../src/classes/InvalidArgumentError';
import UnknownMethodError from '../../src/classes/UnknownMethodError';

class TestObject extends BaseObject {
  public userId: number = 345;
  protected _active: boolean = true;

  public getUserId(): number {
    return this.userId;
  }

  public async isActive(): Promise<boolean> {
    return this._active;
  }

  public setUserId(id: number): void {
    this.userId = id;
  }
}

//<editor-fold desc=".setProperty()">
describe('Object initialization', () => {
  it('Initializing instance without any props', async () => {
    const instance = new TestObject();
    expect(instance).toBeInstanceOf(TestObject);
  });

  it('Initializing instance with props', async () => {
    const instance = new TestObject({prop: 'value'});
    expect(instance).toBeInstanceOf(TestObject);
    expect(instance.hasProperty('prop')).toEqual(true);
    expect(instance.getProperty('prop')).toEqual('value');
  });
  it('Error: Initializing instance with invalid value type (other than plain object)', async () => {
    try {
      // @ts-ignore
      new BaseObject('invalid');
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidArgumentError);
      expect(e.message).toEqual(`Properties must be a plain object`);
    }
  });
});

//<editor-fold desc=".setProperty()">
describe('Setting up object properties .setProperty()', () => {
  let instance: TestObject;

  beforeEach(() => {
    instance = new TestObject();
  });

  it('Having object property: (userId: number)', function () {
    expect(instance.hasProperty('userId')).toBe(true);
  });

  it('Setting object property: userId', function () {
    instance.setProperty('userId', 121);
    expect(instance.getProperty('userId')).toBe(121);
  });

  it('Setting property: role: string (scope: read-write)', function () {
    instance.setProperty('role', 'admin', 'read-write');
    expect(instance.getProperty('role')).toBe('admin');
  });

  it('Setting property: freeze: boolean (scope: read)', function () {
    instance.setProperty('freeze', true, 'read');
    expect(instance.getProperty('freeze')).toBe(true);
  });

  it('Setting property: secret: string (scope: write)', function () {
    instance.setProperty('secret', '!!secret!!', 'write');
    expect(instance.hasProperty('secret')).toBe(true);
  });
  it('Error: Try to access (secret: string) write-only property', async () => {
    try {
      instance.getProperty('secret');
    } catch (e) {
      expect(e).toBeInstanceOf(UnknownPropertyError);
      expect(e.message).toEqual(`Trying to get unknown property: ${instance.constructor.name}.secret`);
    }
  });
  it('Error: Set property with invalid/unknown scope', async () => {
    const scope = 'unknown';

    try {
      // @ts-ignore
      instance.setProperty('secret', 'updated', scope);
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidScopeError);
      expect(e.message).toEqual(`Trying to set property with invalid scope: '${scope}'`);
    }
  });
  it('Error: Trying to set readonly property', async () => {
    instance.setProperty('freeze', true, 'read');
    try {
      // @ts-ignore
      instance.setProperty('freeze', false);
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidCallError);
      expect(e.message).toEqual(`Trying to set read-only property: '${instance.constructor.name}.freeze'`);
    }
  });
});
//</editor-fold>

//<editor-fold desc=".hasProperty()">
describe('Checking property existence .hasProperty()', () => {
  let instance: TestObject;

  beforeEach(() => {
    instance = new TestObject({status: 'blocked'});
  });

  it('Validates undefined object property "username" should not exist', async () => {
    expect(instance.hasProperty('username')).toEqual(false);
  });

  it('Validates object property "userId" should exist', async () => {
    expect(instance.hasProperty('userId')).toEqual(true);
  });

  it('Validates property "role(scope:read-write)" exist', async () => {
    instance.setProperty('role', 'admin');
    expect(instance.hasProperty('role')).toEqual(true);
  });

  it('Validates property "freeze(scope:read)" exist', async () => {
    instance.setProperty('freeze', true);
    expect(instance.hasProperty('freeze')).toEqual(true);
  });

  it('Validates property "secret(scope:write)" exist', async () => {
    instance.setProperty('secret', true);
    expect(instance.hasProperty('secret')).toEqual(true);
  });

  it('Undefined property unknown(scope:unknown) should not exist', async () => {
    expect(instance.hasProperty('unknown')).toEqual(false);
  });
});
//</editor-fold>

//<editor-fold desc=".hasMethod() for methods">
describe('Verifying methods: .hasMethod()', () => {
  let instance: TestObject;

  beforeEach(() => {
    instance = new TestObject();
  });

  it(`Having object method: 'getUserId()'`, async () => {
    expect(instance.hasMethod('getUserId')).toBe(true);
  });

  it(`Having object async method: 'isActive()'`, async () => {
    expect(instance.hasMethod('isActive')).toBe(true);
  });

  it(`Adding new method: 'validate'`, async () => {
    instance.setProperty('validate', (fieldName: string) => `validate method invoked for '${fieldName}'`, 'read');
    expect(instance.hasMethod('validate')).toBe(true);
  });
});
//</editor-fold>

//<editor-fold desc=".canSetProperty()">
describe('Verify set access for properties .canSetProperty()', () => {
  let instance: TestObject;

  beforeEach(() => {
    instance = new TestObject();
    instance.setProperty('role', 'admin', 'read-write');
    instance.setProperty('freeze', true, 'read');
    instance.setProperty('secret', '#####', 'write');
  });

  it('Can set "role(scope:read-write)" property?', () => {
    expect(instance.canSetProperty('role')).toBe(true);
  });
  it('Can set "freeze(scope:read)" property?', () => {
    expect(instance.canSetProperty('freeze')).toBe(false);
  });
  it('Should not set "secret(scope:write)" property', () => {
    expect(instance.canSetProperty('secret')).toBe(true);
  });
  it('Can set "undefined" property?', () => {
    expect(instance.canSetProperty('undefined')).toBe(true);
  });
  it('Can set "userId(object)" property?', () => {
    expect(instance.canSetProperty('userId')).toBe(true);
  });
});
//</editor-fold>

//<editor-fold desc=".canGetProperty()">
describe('Verify get access for properties .canSetProperty()', () => {
  let instance: TestObject;

  beforeEach(() => {
    instance = new TestObject();
    instance.setProperty('role', 'admin', 'read-write');
    instance.setProperty('freeze', true, 'read');
    instance.setProperty('secret', '#####', 'write');
  });

  it('Can access or read "role(scope:read-write)" property?', () => {
    expect(instance.canGetProperty('role')).toBe(true);
  });
  it('Can access or read "freeze(scope:read)" property?', () => {
    expect(instance.canGetProperty('freeze')).toBe(true);
  });
  it('Should not access or read "secret(scope:write)" property', () => {
    expect(instance.canGetProperty('secret')).toBe(false);
  });
  it('Should not access or read "undefined" property.', () => {
    expect(instance.canGetProperty('undefined')).toBe(false);
  });
  it('Can access or read "userId(object)" property?', () => {
    expect(instance.canGetProperty('userId')).toBe(true);
  });
});
//</editor-fold>

//<editor-fold desc=".getProperty()">
describe('Reading properties .getProperty()', () => {
  let instance: TestObject;

  beforeEach(async () => {
    instance = new TestObject();
    instance.setProperty('role', 'admin', 'read-write');
    instance.setProperty('freeze', true, 'read');
    instance.setProperty('secret', '#####', 'write');
    instance.setProperty('hobbies', ['basketball', 'cooking', 'gaming']);
  });

  it('Reading object\'s property', () => {
    expect(instance.getProperty('userId')).toBe(345);
  });

  it('Failed: Read undefined property without exception', async () => {
    expect(instance.getProperty('unknownProp', false)).toBe(undefined);
  });

  it('Reading property with read-write scope', () => {
    expect(instance.getProperty('role')).toBe('admin');
  });

  it('Reading an updated property value', async () => {
    instance.setProperty('role', 'guest');
    expect(instance.getProperty('role')).toBe('guest');
  });

  it('Reading a property value with array value', async () => {
    const value = instance.getProperty<string[]>('hobbies');
    expect(typeof value).toBe('object');
    expect(Array.isArray(value)).toBe(true);
    expect(value.length).toBe(3);
    expect(value[1]).toBe('cooking');
  });

  it('Reading property with read scope', () => {
    expect(instance.getProperty('freeze')).toBe(true);
  });
  it('Error: Try to read "undefined" property', async () => {
    try {
      instance.getProperty('undefined');
    } catch (e) {
      expect(e).toBeInstanceOf(UnknownPropertyError);
      expect(e.message).toEqual(`Trying to get unknown property: ${instance.constructor.name}.undefined`);
    }
  });
  it('Error: Try to read "write-only" property', async () => {
    try {
      instance.getProperty('secret');
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidCallError);
      expect(e.message).toEqual(`Trying to read write-only property: ${instance.constructor.name}.secret`);
    }
  });
});
//</editor-fold>

describe('Invoking methods .invoke()', () => {
  let instance: InstanceType<typeof TestObject>;

  beforeEach((): void => {
    instance = new TestObject();
    instance.setProperty('validate', async (fieldName: string): Promise<string> => `__invoked: ${fieldName}`, 'read');
    instance.setProperty('pickFirst', (list: string[]) => list[0], 'read');
  });

  it('Invoke object sync methods (setUserId, getUserId)', async () => {
    await instance.invoke('setUserId', 544);
    const value = await instance.invoke('getUserId');
    expect(value).toBe(544);
  });

  it('Invoke async method (isActive)', async () => {
    const value = await instance.invoke('isActive');
    expect(value).toBe(true);
  });

  it('Error: Trying to invoke undefined method', async () => {
    try {
      // @ts-ignore
      await instance.invoke('callUnknown');
    } catch (e) {
      expect(e).toBeInstanceOf(UnknownMethodError);
      expect(e.message).toEqual(`Trying to call an unknown method: '${instance.constructor.name}.callUnknown()'`);
    }
  });
});

/*describe('', () => {
  let instance;

  beforeEach(() => {
    instance = new TestObject();
  });
});*/
