/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import { readFileSync } from 'node:fs';
import merge from 'deepmerge';
import { compile, Environment, render, renderString, Template } from 'nunjucks';

// utils
import { getAlias } from '../base/aliases';
import { writeTextFile } from './file';

/**
 * Engine environment
 */
const env = new Environment();

/**
 * Map instance of predefined global variables collection
 */
const contextGlobal = new Map<string, any>();

/**
 * Get map of predefined global variables
 */
export const getGlobalContext = (): Record<string, any> => {
  return Object.fromEntries(contextGlobal.entries());
};

/**
 * Loads template file, renders it and writes it to file system
 * Also, check out {@link https://mozilla.github.io/nunjucks/api.html#render|Nunjucks.render()} and
 * @param templatePath - Template file path (alias supported)
 * @param filePath - File path to write rendered contents (alias supported)
 * @param [options] - Additional options
 * @param [options.variables={}] - Key value pairs of variables
 * @param [options.overwrite=false] - Overwrite file upon exists?
 * @param [options.print=false] - Print output message on console upon completion (check 'options.logger' options to customize)
 * @param [options.logger] - Logging options
 * @param options.logger.msg='File saved at {file}' - Logging options
 * @param [options.logger.func=console.log] Logging options
 * @see {@link renderFile} Template rendering
 * @see {@link writeTextFile} Write file to file system
 */
export const renderWriteFile = (templatePath: string, filePath: string, options: Partial<{
  variables: Record<string, any>;
  overwrite: boolean;
  print: boolean;
  logger: Partial<{
    msg: string;
    func: (msg: string) => void;
  }>;
}> = {}): boolean => {
  options = merge({
    variables: {},
    overwrite: false,
    logger: {
      func: console.log,
      msg: 'File saved at {file}',
    },
    print: false,
  }, options);

  const _file = getAlias(filePath);

  const fileContents = renderFile(templatePath, options.variables);

  if (writeTextFile(_file, fileContents, options.overwrite) && options.print) {
    (options.logger?.func || console.log)((options.logger?.msg || 'File saved at {file}').replace(/\{file}/g, _file));
    return true;
  }

  return false;
};

/**
 * Register a global variable which available to all templates
 * @param name - Unique name
 * @param value - The Value to set
 */
export const registerGlobal = (name: string, value: any): void => {
  env.addGlobal(name, value);
  contextGlobal.set(name, value);
};

/**
 * Returns default environment instance
 */
export const getEnvironment = (): Environment => env;

/**
 * @private
 * Merge local context with globals
 */
const _mergeContext = (context: Record<string, any>): Record<string, any> => {
  return merge(getGlobalContext(), context);
};

/**
 * Renders the template text name with the variables.
 * @param str - Template string
 * @param [variables] - Key value pairs of variables
 */
export const renderText = (str: string, variables: Record<string, any> = {}): string => {
  return renderString(str, _mergeContext(variables));
};

/**
 * Renders the template file with the variables.
 * @param aliasOrPath - Alias path or an absolute template file path
 * @param [variables] - Key value pairs of variables
 */
export const renderFile = (aliasOrPath: string, variables: Record<string, any> = {}): string => {
  return render(getAlias(aliasOrPath), _mergeContext(variables));
};

/**
 * Compile the given string into a reusable nunjucks Template object.
 * @param str - Template string
 * @param [environment] - The Environment class is the central object which handles templates.
 * It knows how to load your templates, and internally templates depend on it for
 * inheritance and including templates.
 */
export const compileText = (str: string, environment?: Environment): Template => {
  return compile(str, environment || getEnvironment());
};

/**
 * Compile the given string into a reusable nunjucks Template object.
 * @param aliasOrPath - Alias path or an absolute template file path
 * @param [environment] - The Environment class is the central object which handles templates.
 * It knows how to load your templates, and internally templates depend on it for
 * inheritance and including templates.
 */
export const compileFile = (aliasOrPath: string, environment?: Environment): Template => {
  const content = readFileSync(getAlias(aliasOrPath), { encoding: 'utf8' });
  return compileText(content, environment || getEnvironment());
};
