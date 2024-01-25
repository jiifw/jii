/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {normalize, resolve} from 'node:path';

// classes
import CodeFile from './CodeFile';
import BaseObject, {Props} from '@jii/core/dist/classes/BaseObject';

// utils
import {isFile} from '@jii/core/dist/helpers/path';
import {renderFile, renderText} from '@jii/core/dist/helpers/nunjucks';
import {readTextFile} from '@jii/core/dist/helpers/file';

/**
 * CodeFile represents a code file to be generated.
 */
export default class TemplateCodeFile extends BaseObject {
  /**
   * The file path that the new code should be saved to.
   */
  public path: string = null;

  /**
   * The template file path
   */
  protected templatePath: string = null;

  /**
   * The code file instance
   */
  public codeFile: CodeFile = null;

  /**
   * The variables pass to template file contents before rendering.
   */
  private _variables: Record<string, any> = {};

  /**
   * Constructor.
   * @param path - The file path that the new code should be saved to.
   * @param templatePath - The template file path.
   * @param props - Name-value pairs that will be used to initialize the object properties
   */
  public constructor(path: string, templatePath: string = null, props: Props = {}) {
    super(props);
    this.path = normalize(path);

    // fix extension
    templatePath = templatePath.replace(/\.njk$/, '') + '.njk';

    if (!isFile(templatePath)) {
      throw new Error(`The template file '${templatePath}' does not exist.`);
    }

    this.templatePath = resolve(templatePath);
    this.codeFile = new CodeFile(path, '');
  }

  /**
   * @returns The rendering variables
   */
  public getVariables(): Record<string, any> {
    return this._variables;
  }
  /**
   * @returns The template file path
   */
  public getTemplatePath(): string {
    return this.templatePath;
  }

  /**
   * Sets rendering variables
   */
  public setVariables(value: Record<string, any>): void {
    this._variables = value;
  }

  /**
   * Saves the code into the file specified by {@link path TemplateCodeFile.path}.
   * @returns The error occurred while saving the code file, or true if no error.
   */
  public async save(): Promise<string | boolean> {
    const templateContent = readTextFile(this.getTemplatePath())
    this.codeFile.content = renderText(templateContent, this.getVariables());
    this.codeFile.trackFile();
    return this.codeFile.save();
  }

  /**
   * The code file extension (e.g. js, txt)
   */
  public getType(): string {
    return this.codeFile.getType();
  }
}
