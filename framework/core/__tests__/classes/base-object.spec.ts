/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import BaseObject from '../../src/classes/BaseObject';

describe('class BaseObject', () => {
  const obj = new BaseObject({prop1: 'prop1-value', prop2: 'prop2-value'});

  it('Initializing instance without any props', async () => {
    const instance = new BaseObject();
    expect(instance).toBeInstanceOf(BaseObject);
  });

  it('Initializing instance with props', async () => {
    const instance = new BaseObject({prop: 'value'});
    expect(instance).toBeInstanceOf(BaseObject);
    expect(instance.hasProperty('prop')).toEqual(true);
  });
  it('Initializing instance with invalid props', async () => {
    try {
      // @ts-ignore
      new BaseObject('invalid');
    } catch (e) {
      expect(e.message).toBe('config must be an object');
    }
  });

  it('Initializes the instance', async () => {
    // noinspection JSVoidFunctionReturnValueUsed
    expect(typeof obj.init()).toBe('undefined');
  });

  it('Get pre-construct properties (prop1, prop2)', async () => {
    expect(obj.getProperty('prop1')).toEqual('prop1-value');
    expect(obj.getProperty('prop2')).toEqual('prop2-value');
  });

  it('Setting pre-construct property "prop1" value', async () => {
    obj.setProperty('prop1', 'changed');
    expect(obj.getProperty('prop1')).toEqual('changed');
  });

  it('Set property with a write scope', async () => {
    obj.setProperty('write-only', 'hidden', 'write');
  });

  it('Validate that pre-construct property "prop2" exists', async () => {
    expect(obj.hasProperty('prop2')).toEqual(true);
  });

  it('Validate that pre-construct property "prop3" should no exist', async () => {
    expect(obj.hasProperty('prop3')).toEqual(false);
  });
  it('Try to get undefined property', async () => {
    try {
      obj.getProperty('unknown-prop');
    } catch (e) {
      expect(e.message).toBe(`Property 'unknown-prop' not found`);
    }
  });

  it('Try to get undefined property with undefined value', async () => {
    expect(obj.getProperty('unknown-prop', false)).toEqual(undefined);
  });
  it('Try to get property with write scope', async () => {
    try {
      obj.getProperty('write-only');
    } catch (e) {
      expect(e.message).toBe(`Cannot read property 'write-only'`);
    }
  });
  it('Setting property with invalid/unknown scope', async () => {
    try {
      // @ts-ignore
      obj.setProperty('invalid-scope', 'data', 'invalid');
    } catch (e) {
      expect(e.message).toBe(`Invalid scope: 'invalid', should be one of 'read, write, read-write'`);
    }
  });
  it('Setting property with read scope', async () => {
    obj.setProperty('read-only', 'visible', 'read');

    try {
      // @ts-ignore
      obj.setProperty('read-only', 'hidden');
    } catch (e) {
      expect(e.message).toContain(`Cannot set property`);
    }
  });

  it('Verify that read only property cannot be set', async () => {
    obj.setProperty('read-only-to-check', 'visible', 'read');
    expect(obj.canSetProperty('read-only-to-check')).toEqual(false);
  });

  it('Verify that write only property should not readable', async () => {
    obj.setProperty('write-only-to-check', 'visible', 'write');
    expect(obj.canGetProperty('write-only-to-check')).toEqual(false);
  });

  it('Verify that prop with the value as method exist', async () => {
    obj.setProperty('method-only-to-check', () => {});
    expect(obj.hasMethod('method-only-to-check')).toEqual(true);
  });
});
