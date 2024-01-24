/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {join} from 'node:path';
import merge from 'deepmerge';

// classes
import BaseObject from '@jii/core/dist/classes/BaseObject';
import NotImplementedError from '@jii/core/dist/classes/NotImplementedError';

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
   */
  protected async collectInputs(): Promise<Record<string, any>> {
    return {};
  }

  /**
   * Variables to be passed to the {@link writeFile writeFile()}`
   */
  public async variables(): Promise<Record<string, any>> {
    return {};
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
      variables: this.variables(),
      print: true,
    }, options));
  }

  /**
   * Write files to disk
   * @param inputs - The inputs to be passed to the generator, see {@link collectInputs collectInputs()}
   * @param variables - The variables to be passed to the generator, see {@link variables variables()}
   */
  public async writeFiles(inputs: Record<string, any>, variables: Record<string, any>): Promise<void> {
  }

  /**
   * Execute the generator
   *
   * **Note**: If you override this method, you must call the super method.
   */
  public async execute(): Promise<void> {
    const inputs = await this.collectInputs();
    const variables = await this.variables();
    return this.writeFiles(inputs, variables);
  }
}
