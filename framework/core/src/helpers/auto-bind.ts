/**
 * @see https://github.com/sindresorhus/auto-bind/blob/main/index.js
 */

/**
 * Gets all non-builtin properties up the prototype chain.
 * @param object
 */
const getAllProperties = (object): { [Symbol.iterator](): any } => {
  const properties = new Set();

  do {
    for (const key of Reflect.ownKeys(object)) {
      properties.add([object, key]);
    }
  } while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);

  return properties;
};

export const bindClass = (self: object, {include = [], exclude = []}: { include?: string[], exclude?: string[] } = {}) => {
  const filter = key => {
    const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);

    if (include) {
      return include.some(match);
    }

    if (exclude) {
      return !exclude.some(match);
    }

    return true;
  };

  for (const [object, key] of getAllProperties(self.constructor.prototype)) {
    if (key === 'constructor' || !filter(key)) {
      continue;
    }

    const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
    if (descriptor && typeof descriptor.value === 'function') {
      self[key] = self[key].bind(self);
    }
  }

  return self;
};
