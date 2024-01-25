/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import merge from 'deepmerge';
import {join} from 'node:path';

// classes
import BaseObject from '@jii/core/dist/classes/BaseObject';

// utils
import {renderWriteFile} from '@jii/core/dist/helpers/nunjucks';

/**
 * The base class for all prompt generators
 */
export default class PromptGenerator extends BaseObject {
  /**
   * The name of the generator
   */
  public name: string = 'my-prompt';

  /**
   * The value of the prompt
   */
  public value: string = 'my-prompt';

  /**
   * The description of the generator
   */
  public description: string = 'To be described';

  /**
   * Dynamic variables pass to template file(s)
   */
  protected _variables: Record<string, any> = {};

  /**
   * The inputs results map from the user
   * @see {@link collectInputs collectInputs()}
   */
  private _inputs: Record<string, any> = {};

  /**
   * The directory where templates are stored
   * @private
   */
  private _templateDir: string = 'templates';

  /**
   * @returns The directory where templates are stored
   */
  public getTemplatesDir(): string {
    return this._templateDir;
  }

  /**
   * Sets the directory where templates are stored
   * @param name - The directory name
   */
  public setTemplatesDir(name: string): void {
    this._templateDir = name;
  }

  /**
   * Collect inputs from the user
   *
   * {@link collectInputs collectInputs()} is called by the {@link execute execute()} method.
   *
   * @example
   * // import {input} from '@inquirer/prompts';
   *
   * protected async collectInputs(): Promise<void> {
   *   const id = await input({
   *     message: 'Unique ID (e.g., "authorization" or "access-token")',
   *     transformer: kebab,
   *     validate(value) {
   *       if (!toString(value, true)) {
   *         return 'Plugin ID should be provided';
   *       }
   *
   *       return true;
   *     },
   *   });
   *
   *   this.setInputs({id});
   * }
   */
  public async collectInputs(): Promise<void> {
  }

  /**
   * Gets prompt input results
   * @see {@link setInputs setInputs()}
   * @see {@link collectInputs collectInputs()}
   */
  public getInputs(): Record<string, any> {
    return this._inputs;
  }

  /**
   * Sets prompt input results
   * @see {@link getInputs getInputs()}
   * @see {@link collectInputs collectInputs()}
   */
  public setInputs(variables: Record<string, any>): void {
    this._inputs = variables;
  }

  /**
   * Get variables
   * @see {@link setVariables setVariables()}
   */
  public getVariables(): Record<string, any> {
    return this._variables;
  }

  /**
   * Sets variables
   * @see {@link getVariables getVariables()}
   */
  public setVariables(variables: Record<string, any>): void {
    this._variables = variables;
  }

  /**
   * Render a template file and write results to a file
   * @param template - the template name (without extension)
   * @param outputFile - Absolute path to the output file
   * @param options - Additional Options to pass to '`renderWriteFile`'.
   * @returns `true` if the file was rendered successfully, `false` otherwise.
   * @see {@link renderWriteFile renderWriteFile()}
   *
   * **Note**: If you override this method, you must call the super method.
   */
  protected writeFile(template: string, outputFile: string, options: Partial<{
    variables: Record<string, any>;
    overwrite: boolean;
    print: boolean;
    logger: Partial<{
      msg: string;
      func: (msg: string) => void;
    }>;
  }> = {}): boolean {
    const filePath = join(this.getTemplatesDir(), template).replace(/\.njk$/, '') + '.njk';
    return renderWriteFile(filePath, outputFile, merge({
      overwrite: true,
      variables: this.getVariables(),
      print: true,
    }, options));
  }

  /**
   * Write files to disk
   * @param inputs - The inputs to be passed to the generator, see {@link collectInputs collectInputs()}
   * @param variables - The variables to be passed to the generator, see {@link getVariables variables()}
   */
  public async writeFiles(inputs: Record<string, any>, variables: Record<string, any>): Promise<void> {
  }

  /**
   * Execute the generator
   *
   * **Note**: If you override this method, you must call the super method.
   */
  public async execute(): Promise<void> {
    return this.writeFiles(this.getInputs(), this.getVariables());
  }
}
