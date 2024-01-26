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
import {readTextFile} from '@jii/core/dist/helpers/file';
import {renderText} from '@jii/core/dist/helpers/nunjucks';

/**
 * CodeFile represents a code file to be generated.
 */
export default class TemplateCodeFile extends BaseObject {
  /**
   * The file path that the new code should be saved to.
   */
  public path: string = null;

  /**
   * The code file instance
   */
  public codeFile: CodeFile = null;

  /**
   * The variables pass to template file contents before rendering.
   */
  private _variables: Record<string, any> = {};

  /**
   * The variables pass to template file contents before rendering.
   */
  private _templateContent: string = '';

  /**
   * Constructor.
   * @param path - The file path that the new code should be saved to.
   * @param templatePath - The template file path.
   * @param props - Name-value pairs that will be used to initialize the object properties
   */
  public constructor(path: string, templatePath: string = null, props: Props = {}) {
    super(props);
    this.path = normalize(path);

    if (templatePath) {
      this.loadTemplate(templatePath);
    }

    this.codeFile = new CodeFile(path, '');
  }

  /**
   * Loads template from the given path
   * @param path - Template file path
   */

  public loadTemplate(path: string): void {
    // fix extension
    path = path.replace(/\.njk$/, '') + '.njk';

    if (!isFile(path)) {
      throw new Error(`The template file '${path}' does not exist.`);
    }

    this.setTemplateContent(readTextFile(resolve(path)));
  }

  /**
   * Sets template content
   * @param value - Template text
   */
  public setTemplateContent(value: string): void {
    this._templateContent = value;
  }

  /**
   * Get template content
   */
  public getTemplateContent(): string {
    return this._templateContent;
  }

  /**
   * @returns The rendering variables
   */
  public getVariables(): Record<string, any> {
    return this._variables;
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
    this.codeFile.content = '';

    if ( this.getTemplateContent().trim() ) {
      this.codeFile.content = renderText(this.getTemplateContent(), this.getVariables());
    }

    this.codeFile.trackFile();
    return this.codeFile.save();
  }
}
