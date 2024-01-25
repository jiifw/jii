/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {chmodSync} from 'node:fs';
import {normalize, extname} from 'node:path';

// classes
import BaseObject, {Props} from '@jii/core/dist/classes/BaseObject';

// utils
import Jii from '@jii/core/dist/Jii';
import {md5} from '@jii/core/dist/helpers/crypto';
import {strpos, substr} from '@jii/core/dist/helpers/string';
import {readTextFile, writeTextFile} from '@jii/core/dist/helpers/file';
import {dirname, isDir, isFile, createDir} from '@jii/core/dist/helpers/path';

/**
 * CodeFile represents a code file to be generated.
 */
export default class CodeFile extends BaseObject {
  /**
   * The code file is new.
   */
  public static readonly OP_CREATE: string = 'create';

  /**
   * The code file already exists, and the new one may need to overwrite it.
   */
  public static readonly OP_OVERWRITE: string = 'overwrite';

  /**
   * The new code file and the existing one are identical.
   */
  public static readonly OP_SKIP: string = 'skip';

  /**
   * An ID that uniquely identifies this code file.
   */
  public id: string = null;

  /**
   * The file path that the new code should be saved to.
   */
  public path: string = null;

  /**
   * The newly generated code content
   */
  public content: string = null;

  /**
   * The operation to be performed.
   *
   * This can be {@link OP_CREATE}, {@link OP_OVERWRITE} or {@link OP_SKIP}.
   */
  public operation: string = null;

  /**
   * Constructor.
   * @param path - The file path that the new code should be saved to.
   * @param content - The newly generated code content.
   * @param props - Name-value pairs that will be used to initialize the object properties
   */
  public constructor(path: string, content: string = null, props: Props = {}) {
    super(props);
    this.path = normalize(path);
    this.content = content;
    this.id = md5(path);

    this.trackFile();
  }

  /**
   * Track file and update operation based on existence or identical contents
   * @see {@link path CodeFile.path}
   * @see {@link content CodeFile.content}
   */
  public trackFile(): void {
    if (isFile(this.path)) {
      this.operation = readTextFile(this.path) === this.content
        ? this.operation = CodeFile.OP_SKIP
        : this.operation = CodeFile.OP_OVERWRITE;
    } else {
      this.operation = CodeFile.OP_CREATE;
    }
  }

  /**
   * Saves the code into the file specified by {@link path}.
   * @returns The error occurred while saving the code file, or true if no error.
   */
  public async save(): Promise<string | boolean> {
    if (this.operation === CodeFile.OP_CREATE) {
      const dir = dirname(this.path);
      if (!isDir(dir)) {
        const result = createDir(dir);
        if (!result) {
          return `Unable to create the directory '${dir}'.`;
        }

        chmodSync(dir, 0o755);
      }
    }

    if (!writeTextFile(this.path, this.content)) {
      return `Unable to write the file '${this.path}'.`;
    }

    chmodSync(this.path, 0o666);

    return true;
  }

  /**
   * The code file extension (e.g. js, txt)
   */
  public getType(): string {
    return extname(this.path).replace(/^\.+/, '');
  }
}
