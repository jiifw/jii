/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {sha1, generateHash} from '../../src/helpers/crypto';

const RANDOM_INPUT: string = 'u0d0CBH1sYU/lj*/gQut5+yeuPMO2Uuk#qmDLnM8';

describe('crypto module', () => {
  it('Generate a sha1 hash', async () => {
    const hash = sha1(RANDOM_INPUT).toString();
    expect(typeof hash).toBe('string');
    expect(hash).toEqual('50dfc37997cad9c65181986a10885568643e1a35');
  });

  it('Generate a random salt of from random string', async () => {
    const salt = generateHash(RANDOM_INPUT);
    expect(typeof salt).toBe('string');
  });
});
