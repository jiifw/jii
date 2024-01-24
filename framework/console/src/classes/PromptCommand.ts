/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import {glob} from 'glob';
import {resolve} from 'node:path';
import {select} from '@inquirer/prompts';

// classes
import Command from './Command';
import PromptGenerator from './PromptGenerator';
import InvalidConfigError from '@jii/core/dist/classes/InvalidConfigError';

// utils
import Jii from '@jii/core/dist/Jii';
import {isPath} from '@jii/core/dist/helpers/path';

// types
import {Props} from '@jii/core/dist/classes/BaseObject';

/**
 * The Prompt Command class to create interactive CLI commands with templates and prompts
 */
export default class PromptCommand extends Command {
  /**
   * Displays a prompt to choose a schematic form
   */
  public promptMessage: string = 'Choose a schematic form';

  /**
   * Base path to retrieve generators from
   */
  public basePath: string = null;

  /**
   * Directory where the generators are located
   */
  public directory: string = 'generators';

  /**
   * Loaded generators
   */
  protected generators: Map<string, PromptGenerator> = new Map;

  /**
   * Creates an instance of PromptGenerator
   * @param filePath - The path to the generator file
   * @param config - The configuration for the generator
   * @returns The instance of the generator
   * @protected
   */
  protected createGeneratorInstance(filePath: string, config: Props = {}): PromptGenerator {
    return Jii.createObject(filePath, [config]);
  }

  /**
   * Retrieves the list of generators from the given directory
   * @protected
   */
  protected async loadGenerators(): Promise<void> {
    if (!this.basePath) {
      throw new InvalidConfigError(`You must provide a base path to retrieve generators from '${this.directory}' directory`);
    }

    const basePath: string = resolve(this.basePath, this.directory);

    if (!isPath(basePath, 'dir')) {
      throw new InvalidConfigError(`Generators directory does not exist: '${basePath}'`);
    }

    const lists: string[] = await glob('**/index.@(ts|js)', {cwd: basePath, absolute: true});

    this.generators = new Map;

    if (!lists.length) {
      return;
    }

    for await (const generatorFile of lists) {
      const instance = await this.createGeneratorInstance(generatorFile);
      this.generators.set(instance.name, instance);
    }
  };

  /**
   * @inheritDoc
   */
  public async action(arg?: string | null, options?: { [p: string]: string }, command?: Command): Promise<void> {
    // initialize generators
    await this.loadGenerators();

    const choices = [...this.generators.values()].map(instance => ({
      name: instance.name,
      value: instance.value,
      description: instance.description,
    }));

    const schematic = await select({
      message: this.promptMessage,
      choices,
    });

    await this.generators.get(schematic)?.execute();
  }
}
