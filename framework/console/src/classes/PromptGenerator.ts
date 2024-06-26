/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {join, resolve} from 'node:path';

// classes
import BaseObject from '@jii/core/dist/classes/BaseObject';
import TemplateCodeFile from './TemplateCodeFile';

// utils
import Jii from '@jii/core/dist/Jii';
import {input} from '@inquirer/prompts';
import {kebab} from '@jii/core/dist/helpers/inflector';
import {toString} from '@jii/core/dist/helpers/string';

/**
 * The base class for all prompt generators
 *
 * @example
 *
 * export default class MyPromptGenerator extends PromptGenerator {
 *   public name: string = 'my-prompt';
 *   public value: string = 'my-prompt';
 *   public description: string = 'A quick intro regarding your command';
 *
 *   public async prepare(): Promise<void> {
 *     // logic here
 *   }
 *
 *   public async prepareFiles(): Promise<void> {
 *     // logic here
 *   }
 * }
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
   * The package id
   */
  public packageId: string = null;

  /**
   * The package label for input command
   */
  public packageLabel: string = 'Package name';

  /**
   * The description of the generator
   */
  public description: string = 'To be described';

  /**
   * The base path
   */
  public basePath: string = null;

  /**
   * The inputs results map from the user
   * @see {@link prepare prepare()}
   */
  private _inputs: Record<string, any> = {};

  /**
   * The directory where templates are stored
   * @private
   */
  private _templateDir: string = 'templates';

  /**
   * The template files register
   * @private
   */
  protected codeFiles: Map<string, TemplateCodeFile> = new Map();

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
   * {@link prepare prepare()} is called by the {@link execute execute()} method.
   *
   * @example
   * // import {input} from '@inquirer/prompts';
   *
   * protected async prepare(): Promise<void> {
   *   // set base path
   *   this.basePath = __dirname;
   *
   *   await super.prepare();
   *
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
   *
   * **Note**: If you override this method, you must call the super method.
   */
  public async prepare(): Promise<void> {
    //<editor-fold desc="package id">
    this.packageId = await input({
      message: `${this.packageLabel} (e.g., "authorization" or "access-token")`,
      transformer: kebab,
      validate(value) {
        if (!toString(value, true)) {
          return `${this.packageLabel} should be provided`;
        }
        return true;
      },
    });

    this.packageId = kebab(this.packageId);
    //</editor-fold>
  }

  /**
   * Gets prompt input results
   * @see {@link setInputs setInputs()}
   * @see {@link prepare prepare()}
   */
  public getInputs(): Record<string, any> {
    return this._inputs;
  }

  /**
   * Gets prompt input by name
   * @returns The input value or `null` if not found.
   */
  public getInput(name: string): string | null {
    return this._inputs[name] || null;
  }

  /**
   * Sets prompt input results
   * @see {@link getInputs getInputs()}
   * @see {@link prepare prepare()}
   */
  public setInputs(variables: Record<string, any>): void {
    this._inputs = variables;
  }

  /**
   * Initialize the code files based on the output of {@link prepare prepare()}
   *
   * {@link process process()} is called by the {@link execute execute()} method.
   *
   * @see {@link getInputs getInputs()}
   * @see {@link addFile addFile()}
   * @see {@link execute execute()}
   *
   * @example
   * public async prepareFiles(): Promise<void> {
   *   const {id} = this.getInputs();
   *   this.addFile('<template>', '<output-file>', {fileId: id});
   * }
   */
  public async process(): Promise<void> {
  }

  /**
   * Implement some logic once all the operations are done
   *
   * {@link finalize finalize()} is called by the {@link execute execute()} method.
   *
   * @see execute
   *
   * @example
   * public async finalize(): Promise<void> {
   *   console.log('Plugin code ready to use');
   * }
   */
  public async finalize(): Promise<void> {
  }

  /**
   * Returns current template files instances
   */
  public getFiles(): TemplateCodeFile[] {
    return [...this.codeFiles.values()];
  }

  /**
   * Resolves output file and returns absolute output file path
   * @param file - The filename with extensions ('my-file.txt' or '/dir/file.js')
   * @param [dir] - Base path to the directory (alias supported), Defaults to the current package path
   * @param [stripPackageDir=false] - Do not include package name in directory path.
   * @returns The resolved output file path
   */
  public toOutFilePath(file: string, dir: string = null, stripPackageDir: boolean = false): string {
    const packageDir = stripPackageDir ? '' : '/' + this.packageId;
    const basePath = Jii.getAlias((dir || this.basePath) + packageDir, false);
    return resolve(join(basePath, file));
  }

  /**
   * Returns current template files instances
   * @param outputFile - The output file name or path
   * @returns The template code file instance or `null` if not found.
   */
  public getFile(outputFile: string): TemplateCodeFile | null {
    return this.codeFiles.get(outputFile) || null;
  }

  /**
   * Add a template file
   * @param template - The template name (without extension) / Set 'null' to skip template
   * @param outputFile - Absolute path to the output file
   * @param [variables] - Dynamic variables pass to template file
   *
   * **Note**: If you override this method, you must call the super method.
   */
  public addTemplateFile(template: string | null, outputFile: string, variables: Record<string, any> = {}): TemplateCodeFile {
    const codeFile = new TemplateCodeFile(outputFile, null);
    codeFile.setVariables(variables);

    if ( template ) {
      const templateFilePath = resolve(join(this.basePath, this.getTemplatesDir(), template));
      codeFile.loadTemplate(templateFilePath)
    }

    return this.codeFiles.set(outputFile, codeFile).get(outputFile);
  }

  /**
   * Add a template contents
   * @param content - The template content
   * @param outputFile - Absolute path to the output file
   * @param [variables] - Dynamic variables pass to template file
   *
   * **Note**: If you override this method, you must call the super method.
   */
  public addTemplateContent(content: string, outputFile: string, variables: Record<string, any> = {}): TemplateCodeFile {
    const codeFile = new TemplateCodeFile(outputFile, null);
    codeFile.setVariables(variables);
    codeFile.setTemplateContent(content);
    return this.codeFiles.set(outputFile, codeFile).get(outputFile);
  }

  /**
   * Execute the generator
   *
   * **Note**: If you override this method, you must call the super method.
   */
  public async execute(): Promise<void> {
    await this.prepare();
    await this.process();

    for (const codeFile of this.codeFiles.values()) {
      const result = await codeFile.save();

      if (result === true) {
        console.log(`File saved at: '${codeFile.path}`);
        continue;
      }

      console.log('Error while saving file:', result);
    }

    await this.finalize();
  }
}
