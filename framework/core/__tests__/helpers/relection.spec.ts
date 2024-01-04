/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import * as reflection from '../../src/helpers/reflection';

const casesTester = (
  func: Function,
  type: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function',
  cases: Record<string, {
    funcArgs: Array<any>;
    expected: any;
  }>) => {
  for (const [title, {funcArgs, expected}] of Object.entries(cases)) {
    it(title, async () => {
      const result = func.apply(null, funcArgs);
      expect(typeof result).toBe(type);
      expect(result).toEqual(expected);
    });
  }
};

class Customer {
}

class PremiumCustomer extends Customer {
}

describe('reflection module [isClass()]', () => {
  const tests = {
    'Validate logic against null': {funcArgs: [null], expected: false},
    'Validate logic against undefined': {funcArgs: [undefined], expected: false},
    'Validate logic against array': {funcArgs: [[]], expected: false},
    'Validate logic against object': {funcArgs: [{}], expected: false},
    'Validate logic against number': {funcArgs: [11], expected: false},
    'Validate logic against arrow function': {
      funcArgs: [() => {
      }], expected: false,
    },
    'Validate logic against anonymous function': {
      funcArgs: [function () {
      }], expected: false,
    },
    'Validate logic against named function': {
      funcArgs: [function test () {
      }], expected: false,
    },
    'Validate logic against named function with args': {
      funcArgs: [function test (test) {
        return test;
      }], expected: false,
    },
    'Validate logic against string': {funcArgs: ['untouched'], expected: false},
    'Validate logic against class': {funcArgs: [Customer], expected: true},
    'Validate logic against extended class': {funcArgs: [PremiumCustomer], expected: true},
  };

  casesTester(reflection.isClass, 'boolean', tests);
});
