/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

/**
 * Check if a function is an async function that returns a promise or nor
 * @param [func] - Function to check
 * @returns true if the function is an async function
 */
export const isAsyncFunction = (func: any): boolean => {
  return 'function' === typeof func
    && (<Function>func).constructor.name === 'AsyncFunction';
};

/**
 * Check if a function is a non-async function and does not return a promise
 * @param [func] - Function to check
 * @returns true if the function is a sync function
 */
export const isSyncFunction = (func: any): boolean => {
  return 'function' === typeof func
    && (<Function>func).constructor.name === 'Function';
};

/**
 * Check if a function is an actual a function or not
 * @param [func] - Function to check
 * @returns true if the function is a function
 */
export const isFunction = (func: any): boolean => {
  return isSyncFunction(func) || isAsyncFunction(func);
};

/**
 * Check if a value is a promise
 * @param value - Value to check
 * @returns If the value is a promise
 */
export const isPromise = (value: any): boolean => {
  return 'function' === typeof value && value.constructor.name === 'Promise';
};

/**
 * Convert a function to a promisified function
 * @param func - The function
 * @param [args] - List of arguments pass to the function
 * @param [thisArg] - The object to be used as a (this) context object.
 * @returns The output produced by a function
 */
export const promisify = <T = any>(func: Function | (() => T), args: any[] = [], thisArg = null): Promise<T> => {
  return new Promise((resolve, reject): void => {
    try {
      resolve((<Function>func).apply(thisArg, args));
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Invoke a function with arguments
 *
 * **Note**: It will first transform then sync method (if present) into async and then execute it. *(no effects to async method)*
 *
 * @param func - Sync or async function
 * @param [args] - List of arguments pass to the function
 * @param [thisArg] - The object to be used as a (this) context object.
 * @returns The output produced by a function
 *
 * @example Anonymous async
 * await invoke(async () => unlink('path/to/cache.bin'));
 *
 * @example Anonymous async function: with arguments
 * await invoke(async (filePath: string) => {
 *   await unlink(filePath);
 * }, ['path/to/file.tmp']);
 *
 * @example Anonymous sync function
 * await invoke((tracked: string) => {
 *   console.log('User tracked?', tracked);
 * }, ['yes']);
 *
 * @example Invoking named function
 * function trackUser(user: string) {
 *   console.log('Tracking started:', user);
 * }
 *
 * await invoke(trackUser, ['junaid']);
 */
export const invoke = async (func: any, args: any[] = [], thisArg = null): Promise<any> => {
  if (isAsyncFunction(func)) {
    return (<Function>func).apply(thisArg, args);
  }

  if (isSyncFunction(func)) {
    return promisify(func, args, thisArg);
  }

  throw new Error(`You must provide a valid function but' ${typeof func}' given`);
};

/**
 * Invoke an instance or a class method with arguments
 * @param target - The target object (either an instance or a class)
 * @param funcName - The method name
 * @param [args] - List of arguments pass to the method
 * @returns The output produced by a method
 *
 * @example
 * class Greeting {
 *   sayHi(name: string): string {
 *     return "Hi, " + name;
 *   }
 *
 *   static sayBye(name: string): string {
 *     return "Bye, " + name;
 *   }
 * }
 *
 * const greet = new Greeting;
 *
 * const methodOutput = await invokeMethod(greet, 'sayHi', ['Junaid']);
 * console.log(methodOutput); // expected: Hi, Junaid
 *
 *
 * const staticOutput = await invokeMethod(Greeting, 'sayBye', ['Junaid']);
 * console.log(staticOutput); // expected: Bye, Junaid
 */
export const invokeMethod = async (target: object, funcName: string, args: any[]): Promise<any> => {
  if (!target) {
    throw new Error(`The target must be an instance of a class or a class itself but '${typeof target}' given`);
  }

  let objFunc;

  if (typeof target === 'function' && Reflect.ownKeys(target).includes(funcName)) {
    objFunc = target[funcName];
  } else if (typeof target[funcName] === 'function') {
    objFunc = target[funcName];
  }

  if (!objFunc) {
    throw new Error(`The target has no such function ${funcName}`);
  }

  return isAsyncFunction(objFunc)
    ? objFunc.apply(target, args)
    : promisify(objFunc, args, target);
};
