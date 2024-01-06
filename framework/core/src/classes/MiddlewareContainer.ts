/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

export type MetaData = {
  [name: string | symbol]: any;
  directory: string;
  type: string;
}

export type MiddlewareAttributes = {
  [name: string | symbol]: any;
}

export interface MiddlewareConfig {
  metadata: MetaData;
  config: {
    [name: string]: any;
  };
  attributes: MiddlewareAttributes;
}

const LINK_PREFIX: string = '$$_';

/**
 * Middleware registrar container
 */
export default class MiddlewareContainer {
  protected registry: Map<string, MiddlewareConfig>;
  protected _links: Map<string, string>;

  /**
   * MiddlewareContainer constructor
   */
  constructor() {
    this.registry = new Map();
    this._links = new Map();
  }

  /**
   * Normalize configuration
   * @param name - Middleware name or path
   * @param [config] - Configuration object
   * @param [metadata] - Additional metadata
   */
  protected processConfig<T = Record<string, any>>(name: string, config: T, metadata: MetaData): MiddlewareConfig {
    return {
      metadata,
      config,
      attributes: {},
    };
  }

  /**
   * Get linked middleware list
   */
  get links(): { [name: string]: string } {
    const collection = [...this._links.entries()].map(([k, v]) => {
      return [this.omitLinkId(k), v];
    });
    return Object.fromEntries(collection);
  }

  /**
   * Get middleware list
   */
  get list(): string[] {
    return [...this.registry.keys()];
  }

  /**
   * Register a middleware along with the configuration
   * @param name - Middleware name or path
   * @param config - Configuration object
   * @param [metadata] - Additional metadata
   */
  public register<T = Record<string, any>>(name: string, config: T, metadata: MetaData) {
    if (this.registry.has(name)) {
      throw new Error(`Middleware '${name}' is already registered`);
    }

    this.registry.set(
      name,
      this.processConfig(name, config || {}, metadata),
    );
  }

  /**
   * Get middleware configuration
   * @param name - Middleware name or path
   */

  public config<T extends MiddlewareConfig = MiddlewareConfig>(name: string) {
    if (!this.registry.has(name)) {
      throw new Error(`No middleware '${name}' found in registry`);
    }

    return this.registry.get(name).config;
  }

  /**
   * Formats a link id
   * @param id - Unique ID
   * @protected
   */
  protected formatLinkId(id: string): string {
    return LINK_PREFIX + id;
  }

  /**
   * Clears prefix from id
   * @param id - Unique ID
   * @return Normalized link id
   */
  protected omitLinkId(id: string): string {
    const regStr = LINK_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${regStr}`);
    return id.replace(regex, '');
  }

  /**
   * Get middleware configuration
   * @param name - Middleware name or path
   * @param id - Unique ID (format: camelCase) to link with (e.g., cors or corsPlugin)
   */
  public link(name: string, id: string) {
    if (this.isLinked(id)) {
      throw new Error(`The ID '${id}' is already associated with a middleware '${this._links.get(name)}'`);
    }

    if (!this.registry.has(name)) {
      throw new Error(`No middleware '${name}' found in registry`);
    }

    if (!/^[a-z]+([A-Z][a-z]+)*$/.test(id)) {
      throw new Error(`Invalid ID '${id}' for middleware '${name}', Format should be a camelize`);
    }

    this._links.set(this.formatLinkId(id), name);
  }

  /**
   * Check that middleware is registered or not
   * @param name - Middleware name or path
   */
  public isRegistered(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * Check that middleware has linked with ID or not
   * @param name - Middleware name or path
   */
  public isLinked(name: string): boolean {
    return this._links.has(this.formatLinkId(name));
  }

  /**
   * Check that middleware has in registry or not
   * @param nameOrId - Middleware name or path / Unique ID
   */
  public has(nameOrId: string): boolean {
    return this.isRegistered(nameOrId) || this.isLinked(nameOrId);
  }

  /**
   * Translate link id to middleware name or path
   * @param id - Unique ID
   */
  public toName(id: string): string | undefined {
    return this._links.has(this.formatLinkId(id))
      ? this._links.get(this.formatLinkId(id))
      : undefined;
  }

  /**
   * Translate middleware name or path to link id
   * @param name - Middleware name or path
   */
  public toId(name: string): string | undefined {
    for (const [key, value] of this._links) {
      if (value === name) {
        return this.omitLinkId(key);
      }
    }

    return undefined;
  }

  /**
   * Get middleware data
   * @param nameOrId - Middleware name or path / Unique ID
   */
  protected getByIdOrName(nameOrId: string): MiddlewareConfig {
    if (this.registry.has(nameOrId)) {
      return this.registry.get(nameOrId);
    }

    if (this._links.has(this.formatLinkId(nameOrId))) {
      const name = this._links.get(this.formatLinkId(nameOrId));
      return this.registry.get(name);
    }

    throw new Error(`Unknown ID/Name '${nameOrId}' for middleware'`);
  }

  /**
   * Get middleware metadata
   * @param nameOrId - Middleware name or path / Unique ID
   */

  public metadata<T extends MetaData = MetaData>(nameOrId: string): MetaData {
    return this.getByIdOrName(nameOrId).metadata;
  }

  /**
   * Get middleware directory path
   * @param nameOrId - Middleware name or path / Unique ID
   */
  public getDirectory(nameOrId: string): string {
    return this.metadata(nameOrId).directory;
  }

  /**
   * Get middleware directory path
   * @param nameOrId - Middleware name or path / Unique ID
   */
  public getType(nameOrId: string): string {
    return this.metadata(nameOrId).type;
  }

  /**
   * Sets middleware attribute
   * @param nameOrId - Middleware name or path / Unique ID
   * @param name - Attribute name
   * @param value - The value to store
   */
  public setAttr(nameOrId: string, name: string | symbol, value: any) {
    if (!this.has(nameOrId)) {
      throw new Error(`Unknown ID/Name '${nameOrId}' for middleware'`);
    }
    this.getByIdOrName(nameOrId).attributes[name] = value;
  }

  /**
   * Checks middleware attribute
   * @param nameOrId - Middleware name or path / Unique ID
   * @param name - Attribute name
   */
  public hasAttr(nameOrId: string, name: string | symbol): boolean {
    if (!this.has(nameOrId)) {
      throw new Error(`Unknown ID/Name '${nameOrId}' for middleware'`);
    }
    return name in this.attributes(nameOrId);
  }

  /**
   * Gets middleware attribute
   * @param nameOrId - Middleware name or path / Unique ID
   * @param name - Attribute name
   */
  public getAttr<T>(nameOrId: string, name: string | symbol): T | undefined {
    if (!this.hasAttr(nameOrId, name)) {
      return undefined;
    }
    return this.attributes(nameOrId)[name] || undefined;
  }

  /**
   * Gets middleware attributes
   * @param nameOrId - Middleware name or path / Unique ID
   */
  public attributes<T = MiddlewareAttributes>(nameOrId: string): T {
    if (!this.has(nameOrId)) {
      throw new Error(`Unknown ID/Name '${nameOrId}' for middleware'`);
    }
    return <T>(this.getByIdOrName(nameOrId)?.attributes || {});
  }
}
