/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

import merge from 'deepmerge';
import fastify from 'fastify';

// classes
import ServerEvent from './ServerEvent';
import Component from '@jii/core/dist/classes/Component';

// types
import {ServerInstance, ServerHTTPOptions} from '../typings/server';

/**
 * Server class to handle the server instance.
 */
export default class Server extends Component {
  /**
   * An event raised before the server being initialized
   * @see {@link onInitialize onInitialize()}
   */
  public static readonly EVENT_INITIALIZE: string = 'initialize';

  /**
   * An event raised after the server start listening
   * @see {@link onListen onListen()}
   */
  public static readonly EVENT_LISTEN: string = 'listen';

  /**
   * An event raised when the server encounters an error
   * @see {@link onError onError()}
   */
  public static readonly EVENT_ERROR: string = 'error';

  /**
   * Application state used by {@link state}: server just initiated.
   */
  public static readonly STATE_BEGIN: number = 0;

  /**
   * Application state used by {@link state}: application is initialized {@link  {@link EVENT_LISTEN}.}.
   */
  public static readonly STATE_INIT: number = 1;

  /**
   * Application state used by {@link state}: server is successfully started {@link EVENT_LISTEN}.
   */
  public static readonly STATE_STARTED: number = 2;

  /**
   * The address to bind server to.
   */
  public host: string = 'localhost';

  /**
   * The port to start listen on
   */
  public port: number = 8030;

  /**
   * When true, the server will log all requests.
   */
  public enableLogging: boolean = false;

  /**
   * The options to pass to the server.
   * @see https://fastify.dev/docs/latest/Reference/Server/#factory
   */
  public httpOptions: ServerHTTPOptions = {};

  /**
   * When true routes are registered as case-sensitive. That is, `/foo` is not equal to `/Foo`. When `false` then routes are case-insensitive.
   *
   * <u>Please note</u> that setting this option to `false` goes against {@link https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.2.1 RFC3986}.
   */
  public caseSensitive: boolean = false;

  /**
   * The current server state during a request handling life cycle.
   * This property is managed by the application. Do not modify this property.
   */
  public state: number;

  /**
   * The server instance.
   * @private
   */
  private _server: ServerInstance = null;

  /**
   * Gets the defaults and customer options to pass to the server.
   * @private
   */
  private _getOptions(): ServerHTTPOptions {
    return merge(<ServerHTTPOptions>{
      logger: this.enableLogging,
      caseSensitive: this.caseSensitive,
    }, this.httpOptions ?? {});
  }

  /**
   * Server constructor
   */
  public constructor() {
    super();
    this.state = Server.STATE_BEGIN;
  }

  /**
   * @inheritDoc
   */
  init() {
    this._server = <ServerInstance><unknown>fastify(this._getOptions());
    super.init();
  }

  /**
   * Gets the server instance.
   */
  public getServer(): ServerInstance {
    return this._server;
  }

  /**
   * Initialize and creates the server instance.
   */
  public async createServer(): Promise<void> {
    // register middleware engine
    await this._server.register(require('@fastify/middie'));
    await this.onInitialize();
    this.state = Server.STATE_INIT;
  }

  /**
   * An event raised before the server being initialized.
   */
  public async onInitialize(): Promise<void> {
    const severEvent = new ServerEvent();
    severEvent.server = this._server;
    await this.trigger(Server.EVENT_INITIALIZE);
  }

  /**
   * An event raised after the server start listening.
   */
  public async onListen(): Promise<void> {
    const severEvent = new ServerEvent();
    severEvent.server = this._server;
    await this.trigger(Server.EVENT_LISTEN);
  }

  /**
   * An event raised after the server encounters an error.
   */
  public async onError(error: Error | any): Promise<void> {
    const event = new ServerEvent();
    event.data = error;
    event.owner = this;
    await this.trigger(Server.EVENT_ERROR, event);
  }

  /**
   * Starts the server.
   */
  public async start(callback?: (server?: any) => Promise<void>): Promise<void> {
    try {
      await this._server.listen({host: this.host, port: this.port});
      console.log(`Server is listening on: http://${this.host}:${this.port}`);

      this.state = Server.STATE_STARTED;
      await this.onListen();

      // invoke supplied callback
      'function' === typeof callback && await callback.call(null, this._server);
    } catch (err) {
      await this.onError(err);
      this._server.log.error(err);
      process.exit(1);
    }
  }
}
