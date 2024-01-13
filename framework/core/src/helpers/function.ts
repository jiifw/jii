/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// utils
import {resolve} from './path';
import {hasOwnMethod, hasOwnStaticMethod} from './reflection';

// classes
import InvalidArgumentError from '../classes/InvalidArgumentError';
import InvalidCallError from '../classes/InvalidCallError';
import {EventHandler} from '../classes/Event';

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
    && (func as Function).constructor.name === 'Function';
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
export const promisify = <T = any>(func: Function | (() => T) | (() => Promise<T>), args: any[] = [], thisArg = null): Promise<T> => {
  if (isAsyncFunction(func)) {
    return (func as Function).apply(thisArg, args) as Promise<T>;
  }

  if (isSyncFunction(func)) {
    return new Promise((resolve, reject): void => {
      try {
        resolve((func as Function).apply(thisArg, args));
      } catch (e) {
        reject(e);
      }
    });
  }

  throw new Error(`The arg 'func' should be a function but ${typeof func} given`);
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
  if (isFunction(func)) {
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

/**
 * Validates function or variable is defined or not
 * @param varOrFunc - The variable or function to check
 * @returns true if the variable or function is defined
 */
export const isDefined = (varOrFunc: any): boolean => {
  return typeof varOrFunc !== 'undefined' && varOrFunc !== null;
};

/**
 * Checks if the handler is valid array handler and function belongs to a class/instance or module
 * some examples:
 *
 * 1. <code style="color:#B87333">[instance, 'handleAdd']</code> // object method
 * 2. <code style="color:#B87333">[Page, 'handleAdd']</code> // static class method
 * 3. <code style="color:#B87333">['@app/classes/Page', 'handleAdd']</code> // alias based class path
 * @param handler - The handler to check
 * @see {@link hasOwnStaticMethod hasOwnStaticMethod()}
 * @see {@link hasOwnMethod hasOwnMethod()}
 * @see {@link hasOwnMethod hasOwnMethod()}
 * @see {@link resolve resolve()}
 */
export const checkMethodOf = (handler: [Function | object | string, string]): void => {
  if (!Array.isArray(handler)) {
    throw new InvalidArgumentError(`Handler must be an array, '${typeof handler}' given`);
  }

  if (handler.length !== 2) {
    throw new InvalidArgumentError(`Array handler must be an array with at least 2 elements [object|class, 'functionName']`);
  }

  const [funcOrClass, funcName] = handler;

  if ('function' === typeof funcOrClass) {
    if (!hasOwnStaticMethod(funcOrClass as Function, funcName)) {
      throw new InvalidCallError(`Handler class ${funcOrClass.constructor.name} has no such method ${funcName}`);
    }
    return;
  }

  if ('object' === typeof funcOrClass) {
    if (!hasOwnMethod(funcOrClass as object, funcName)) {
      throw new InvalidCallError(`Handler class ${funcOrClass.constructor.name} has no such method ${funcName}`);
    }
    return;
  }

  if ('string' === typeof funcOrClass) {
    let module: Function;
    try {
      module = require(resolve(funcOrClass)) ?? null;
    } catch (e) {
      throw new InvalidCallError(`The path to the class or module does not exist: '${funcOrClass}'`);
    }

    if (!module) {
      throw new InvalidCallError(`No module has been exported from '${funcOrClass}'`);
    }

    if (!['function', 'object'].includes(typeof module)) {
      throw new InvalidCallError(`The exported module should be a class or an instance of a class`);
    }

    if ( 'function' === typeof module && !hasOwnMethod(module, funcName) ) {
      throw new InvalidCallError(`The module '${funcOrClass}' has no such function ${funcName}`);
    } else if ( 'object' === typeof module && !hasOwnStaticMethod(module, funcName) ) {
      throw new InvalidCallError(`The module '${funcOrClass}' has no such method: '${funcName}'`);
    }

    return;
  }

  throw new InvalidArgumentError(`Handler first argument must be an object, a class or string, '${typeof funcOrClass}' given`);
};

/**
 * Checks that handler is a valid callback. The following are
 * some examples:
 *
 * 1. <code style="color:#B87333">async (event: Event): Promise<void> => { ... }</code> // Anonymous async function
 * 2. <code style="color:#B87333">(event: Event): void => { ... }</code> // Anonymous sync function
 * 3. <code style="color:#B87333">[instance, 'handleAdd']</code> // object method
 * 4. <code style="color:#B87333">[Page, 'handleAdd']</code> // static class method
 * 4. <code style="color:#B87333">['@app/classes/Page', 'handleAdd']</code> // alias based class path
 * 6. <code style="color:#B87333">'handleAdd'</code> // global function
 * @param handler - The handler to check
 * @see {@link checkMethodOf checkMethodOf()}
 * @see {@link isFunction isFunction()}
 * @see {@link isDefined isDefined()}
 */
export const checkEventHandler = (handler: EventHandler): void => {
  if ('function' === typeof handler) {
    if (!isFunction(handler)) {
      throw new InvalidCallError(`Handler must be a valid sync or an async function`);
    }
    return;
  }

  if ('string' === typeof handler) {
    if (!isDefined(handler)) {
      throw new InvalidCallError(`No such function has defined ${handler}`);
    }
    return;
  }

  if ( Array.isArray(handler) ) {
    checkMethodOf(handler);
    return;
  }

  throw new InvalidArgumentError('Invalid handler passed, it should be an array [object|class, functionName], function or a function name');;
};
