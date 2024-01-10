/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

/**
 * Checks if the value is a class
 * @param val - The value
 */
export const isClass = (val: any): boolean => {
  return val && (typeof val === 'function') && /^\s*class\s+/.test(val.toString());
};

/**
 * Get the class hierarchy including the class itself, its parent classes, and implemented interfaces.
 * @param className - The class name.
 * @returns Array of class names in the hierarchy.
 *
 * @example
 * const classObj: string | Function = Event;
 * let className = typeof classObj === 'object' ? classObj.constructor.name : classObj.replace(/^\\/, '');
 * let classes = [className, ...getClassHierarchy(className)];
 *
 * console.log(classes);
 */
export const getClassHierarchy = (className: string): string[] => {
  const hierarchy = [className];
  let parentClass = Object.getPrototypeOf(className);

  while (parentClass) {
    hierarchy.push(parentClass.name);
    parentClass = Object.getPrototypeOf(parentClass);
  }

  return hierarchy;
};

/**
 * Returns all the properties of an object or instance
 * @param obj - The object
 * @returns An object with the properties of the object
 *
 * @example
 * const props = inspectObject({});
 * // expected output
 * {
 *   "constructor": "function",
 *   "__defineGetter__": "function",
 *   "__defineSetter__": "function",
 *   ...
 * }
 *
 * @see https://flaviocopes.com/how-to-list-object-methods-javascript/
 */
export const getObjectInfo = (obj: object): Record<string, string> => {
  if (!obj || 'object' !== typeof obj) {
    throw new Error('The provided object is not an instance of object');
  }

  const properties = new Set();
  let currentObj = obj;

  do {
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
  } while ((currentObj = Object.getPrototypeOf(currentObj)));
  return ([...properties.keys()] as string[]).reduce((accum, item: string) => {
    accum[item] = typeof obj[item];
    return accum;
  }, {});
};

/**
 * Returns all the methods and properties of an object or instance
 * @param obj - The object
 * @param type - The type of the methods to return. Can be 'property' or 'method'
 * @param [omitPrototype] - If true, the prototype properties/methods are not included
 * @returns Object's methods and properties list
 * @see {@link methodsOf methodsOf()} for retrieving methods
 * @see {@link propertiesOf propertiesOf()} for retrieving properties
 */
export const inspectObject = (obj: object, type: 'property' | 'method', omitPrototype: boolean = true): string[] => {
  const nativeList: string[] = omitPrototype ? Object.keys(getObjectInfo({})) : [];

  return Object
    .entries(getObjectInfo(obj))
    .filter(info => {
        const isMethod: boolean = info[1] === 'function';
        const isItA = type === 'method' ? isMethod : !isMethod;

        return !omitPrototype
          ? isItA
          : !nativeList.includes(info[0]) && isItA;
      },
    ).map(info => {
      return info[0];
    });
};

/**
 * Returns all the properties of an object or instance
 *
 * **Note**: The output does not include the *static properties* of an object
 *
 * @param obj - The object
 * @param [omitPrototype] - If true, the prototype properties are not included
 * @returns Object properties list
 *
 * @example
 * const props = propertiesOf({'userId': 3, 'name': 'junaid'});
 * // expected output
 * ["userId", "name"]
 */
export const propertiesOf = (obj: object, omitPrototype: boolean = true): string[] => {
  return inspectObject(obj, 'property', omitPrototype);
};

/**
 * Returns all the methods of an object or instance
 *
 * **Note**: The output does not include the *static methods* of an object
 *
 * @param obj - The object
 * @param [omitPrototype] - If true, the prototype methods are not included
 * @returns Object methods list
 *
 * @example
 * const props = propertiesOf({getId() { return true; }, getName () { return 'junaid'} });
 * // expected output
 * ["getId", "getName"]
 */
export const methodsOf = (obj: object, omitPrototype: boolean = true): string[] => {
  return inspectObject(obj, 'method', omitPrototype);
};

/**
 * Inspect a class and return all the static methods and properties name
 * @param theClass - The class to inspect
 * @param type - The type of the methods to return. Can be 'property' or 'method'
 * @param [omitPrototype] - If true, the prototype properties are not included
 *
 * @example
 * class User {
 *   getName () {}
 *   static getUid() {}
 *   static get uid() {}
 *   get id() {}
 *   get role() { return 'guest'; }
 * }
 *
 * console.log('Properties:', inspectClassAs(User, 'property', true)) // expected: ["uid"]
 * console.log('Methods:', inspectClassAs(User, 'method', true)) // expected: ["getUid"]
 * @see {@link isClass isClass()}
 * @see {@link Object.getOwnPropertyNames Object.getOwnPropertyNames()}
 */
export const inspectClass = (theClass: Function, type: 'property' | 'method', omitPrototype: boolean = true): string[] => {
  if (!theClass || !isClass(theClass)) {
    throw new Error('The provided arguments must be a class or function');
  }

  const nativeList: string[] = omitPrototype ? Object.getOwnPropertyNames(Function) : [];

  return Object.getOwnPropertyNames(theClass).filter(name => {
    const isMethod = 'function' === typeof theClass[name];
    const isItA = type === 'method' ? isMethod : !isMethod;

    return !omitPrototype
      ? isItA
      : !nativeList.includes(name) && isItA;
  });
};

/**
 * Checks if the object has the specified property or a method
 * @param obj - The object
 * @param name - The property or method name (string | symbol)
 * @param type - The type of the method to check. Can be 'property' or 'method'
 * @returns true if the object has the specified property or a method, false otherwise
 *
 * @example
 * class User {
 *   getName () {}
 *   get id() {}
 * }
 *
 * console.log('Method?', hasOwn(new User, 'getName', 'method')); // expected: true
 * console.log('Property?', hasOwn(new User, 'id', 'property')); // expected: true
 * @see {@link hasOwnProperty hasOwnProperty()} _property_ specific
 * @see {@link hasOwnMethod hasOwnMethod()} _method_ specific
 */
export const hasOwn = (obj: object, name: string | symbol, type: 'property' | 'method'): boolean => {
  if (!obj || 'object' !== typeof obj) {
    throw new Error('The provided object is not an instance of object');
  }

  let currentObj = obj;

  do {
    const props = 'symbol' === typeof name
      ? Object.getOwnPropertySymbols(currentObj)
      : Object.getOwnPropertyNames(currentObj);

    for ( const prop of props) {
      if ( name === prop ) {
        const isFunc = 'function' === typeof currentObj[name];
        return (type === 'method' && isFunc)
          || (type === 'property' && !isFunc);
      }
    }
  } while ((currentObj = Object.getPrototypeOf(currentObj)));

  return false;
};

/**
 * Checks if the object has the specified property
 * @param obj - The object
 * @param property - The property name (string | symbol)
 * @returns true if the object has the specified property, false otherwise
 * @see {@link hasOwn hasOwn()}
 *
 * @example
 * class User {
 *   get id () {}
 * }
 *
 * console.log('Property?', hasOwnProperty(new User, 'id')); // expected: true
 */
export const hasOwnProperty = (obj: object, property: string | symbol): boolean => {
  return hasOwn(obj, property, 'property');
}

/**
 * Checks if the object has the specified method
 * @param obj - The object
 * @param method - The method name (string | symbol)
 * @returns true if the object has the specified method, false otherwise
 * @see {@link hasOwn hasOwn()}
 *
 * @example
 * class User {
 *   getName () {}
 * }
 *
 * console.log('Method?', hasOwnMethod(new User, 'getName')); // expected: true
 */
export const hasOwnMethod = (obj: object, method: string | symbol): boolean => {
  return hasOwn(obj, method, 'method');
}

/**
 * Checks if the class has the specified static property or a method
 * @param theClass - The class
 * @param name - The property or method name (string | symbol)
 * @param type - The type of the method to check. Can be 'property' or 'method'
 *
 * @example
 * class User {
 *   static getUid() {}
 *   static get uid() {}
 * }
 *
 * console.log('Method?', hasOwnStatic(User, 'getUid', 'method')); // expected: true
 * console.log('Property?', hasOwnStatic(User, 'uid', 'property')); // expected: true
 * @see {@link hasOwnStaticProperty hasOwnStaticProperty()} _property_ specific
 * @see {@link hasOwnStaticMethod hasOwnStaticMethod()} _method_ specific
 */
export const hasOwnStatic = (theClass: Function, name: string | symbol, type: 'property' | 'method'): boolean => {
  if (!theClass || !isClass(theClass)) {
    throw new Error('The provided object is not a class');
  }

  const props = 'symbol' === typeof name
    ? Object.getOwnPropertySymbols(theClass)
    : Object.getOwnPropertyNames(theClass);

  for ( const prop of props ) {
    if ( prop === name ) {
      const isMethod = 'function' === typeof theClass[name];
      return type === 'method' ? isMethod : !isMethod;
    }
  }

  return false;
};

/**
 * Checks if the class has the specified property (string | symbol)
 * @param theClass - The class
 * @param property - The property name
 * @returns true if the object has the specified property, false otherwise
 * @see {@link hasOwnStatic hasOwnStatic()}
 *
 * @example
 * class User {
 *   static get uuid () {}
 * }
 *
 * console.log('Property?', hasOwnStaticProperty(User, 'uuid')); // expected: true
 */
export const hasOwnStaticProperty = (theClass: Function, property: string | symbol): boolean => {
  return hasOwnStatic(theClass, property, 'property');
}

/**
 * Checks if the class has the specified method (string | symbol)
 * @param theClass - The class
 * @param method - The method name
 * @returns true if the object has the specified method, false otherwise
 * @see {@link hasOwnStatic hasOwnStatic()}
 *
 * @example
 * class User {
 *   static getUid () {}
 * }
 *
 * console.log('Method?', hasOwnStaticMethod(User, 'getUid')); // expected: true
 */
export const hasOwnStaticMethod = (theClass: Function, method: string | symbol): boolean => {
  return hasOwnStatic(theClass, method, 'method');
}
