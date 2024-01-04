/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import * as string from '../../src/helpers/string';

describe('string module [generic]', () => {
  it('Fix slashes in the given string and transform into route', async () => {
    const result = string.sanitizeRoute('This@isA-Bad_Route');
    expect(typeof result).toBe('string');
    expect(result).toEqual('this-isa-bad-route');
  });

  it('Fix route with value having spaces', async () => {
    const result = string.sanitizeRoute('This is A -Bad_Route!!');
    expect(typeof result).toBe('string');
    expect(result).toEqual('this-is-a-bad-route');
  });
});
describe('string module [string.toString()]', () => {
  const tests = {
    'Convert null value into a string': {expr: null, output: ''},
    'Convert undefined value into a string': {expr: undefined, output: ''},
    'Convert array value into a string': {expr: [], output: ''},
    'Convert object value into a string': {expr: {}, output: ''},
    'Convert number value into a string': {expr: 11, output: '11'},
    'Convert function value into a string': {expr: () => {}, output: ''},
    'Convert string value into a string': {expr: 'untouched', output: 'untouched'},
  };

  for (const [title, {expr, output}] of Object.entries(tests)) {
    it(title, async () => {
      const result = string.toString(expr);
      expect(typeof result).toBe('string');
      expect(result).toEqual(output);
    });
  }
});
