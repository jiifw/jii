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
import InvalidCallError from '@jii/core/dist/classes/InvalidCallError';
import InvalidConfigError from '@jii/core/dist/classes/InvalidConfigError';

// types
import {ServerInstance, ServerHTTPOptions} from '~/typings/server';
import {
  MiddlewareAfter, MiddlewareCallback, MiddlewareDefinition,
  MiddlewareMiddleware, MiddlewareRegister, MiddlewareType, ServerComponentDefinition,
} from '~/typings/classes/Server';
import WebPluginEvent from './WebPluginEvent';
import Event from '@jii/core/dist/classes/Event';
import Jii from '@jii/core/dist/Jii';
import WebPlugin from './WebPlugin';
import {SERVER_REPLY, SERVER_REQUEST} from '~/utils/symbols';
import Request from './Request';

/**
 * Middleware supported types
 */
export const MIDDLEWARE_TYPES: MiddlewareType[] = [
  'middleware', 'after', 'callback', 'register',
];

/**
 * Server component to handle the server fastify.
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
   * Cookies options,
   * @see https://github.com/fastify/fastify-cookie#options
   */
  public cookieOptions: ServerComponentDefinition['cookieOptions'] = {};

  /**
   * Favicon options,
   * @see https://github.com/smartiniOnGitHub/fastify-favicon#note
   */
  public faviconOptions: ServerComponentDefinition['faviconOptions'] = {};

  /**
   * Multipart content-type options,
   * @see https://github.com/fastify/fastify-multipart?tab=readme-ov-file#usage
   */
  public multipartOptions: ServerComponentDefinition['multipartOptions'] = {};

  /**
   * Session options, <br>
   * The session data is stored server-side using the configured session store.
   * @see https://github.com/fastify/session?tab=readme-ov-file#options
   */
  public sessionOptions: ServerComponentDefinition['sessionOptions'] = {};

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
  public middleware: MiddlewareDefinition[];

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
   * Whatever the server is started or not.
   * @protected
   */
  protected isStarted: boolean = false;

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
    this.state = Server.STATE_INIT;
    const server = this.getServer();
    // register middleware engine
    await server.register(require('@fastify/middie'));

    /////////////// STARTS: PLUGIN EVENT (BEFORE_APP_RUN) TRIGGER //////////////
    let pluginEvent = new WebPluginEvent();
    pluginEvent.server = server;
    pluginEvent.owner = this;
    for (const handler of Object.values(Jii.plugins.getPluginsEvent(WebPlugin.EVENT_SERVER_INIT))) {
      await Event.triggerHandler(WebPlugin.EVENT_SERVER_INIT, handler, {}, pluginEvent);
    }
    pluginEvent = null;
    /////////////// ENDS: PLUGIN EVENT (BEFORE_APP_RUN) TRIGGER ////////////////

    server.addHook('onRequest', async (request, reply) => {
      Jii.container.memoSync(SERVER_REQUEST, request, {freeze: true});
      Jii.container.memoSync(SERVER_REPLY, reply, {freeze: true});
    });

    // Server handling request event
    await this.handleRequest(server);

    // register predefined middleware
    await this.applyMiddleware(this.getPredefinedMiddleware());

    // register user specific middleware
    await this.applyMiddleware(this.middleware);

    await this.onInitialize();
  }

  public async handleRequest(server: ServerInstance) {
    server.route({url: '/test/:task', method: 'GET', handler () {}});
    server.addHook('preHandler', async (req, reply) => {
      await Jii.app().get<Request>('request').resolve(reply);
      return reply;
    });
  }

  /**
   * An event raised before the server being initialized.
   */
  public async onInitialize(): Promise<void> {
    const severEvent = new ServerEvent();
    severEvent.server = this._server;
    severEvent.owner = this;
    await this.trigger(Server.EVENT_INITIALIZE);
  }

  /**
   * An event raised after the server start listening.
   */
  public async onListen(): Promise<void> {
    const severEvent = new ServerEvent();
    severEvent.server = this.getServer();
    severEvent.owner = this;
    await this.trigger(Server.EVENT_LISTEN);
  }

  /**
   * An event raised after the server encounters an error.
   */
  public async onError(error: Error | any): Promise<void> {
    const event = new ServerEvent();
    event.server = this.getServer();
    event.data = error;
    event.owner = this;
    await this.trigger(Server.EVENT_ERROR, event);
  }

  /**
   * Starts the server.
   * @throws {InvalidCallError} If the server is already started.
   */
  public async start(): Promise<void> {
    if (this.isStarted) {
      throw new InvalidCallError('The server is already started.');
    }

    await this.createServer();

    try {
      await this.getServer().listen({host: this.host, port: this.port});
      console.log(`Server is listening on: http://${this.host}:${this.port}`);

      this.state = Server.STATE_STARTED;
      await this.onListen();

      this.isStarted = true;
    } catch (err) {
      await this.onError(err);
      this.getServer().log.error(err);
      process.exit(1);
    }
  }

  /**
   * Returns predefined server middleware
   * @protected
   */
  protected getPredefinedMiddleware(): MiddlewareDefinition[] {
    return [
      {path: 'fastify-favicon', type: 'register', config: this.faviconOptions || {}},
      {path: 'fastify-graceful-shutdown', type: 'register'},
      {path: 'x-xss-protection', type: 'middleware'},
      {path: '@fastify/accepts', type: 'register'},
      {path: '@fastify/url-data', type: 'register'},
      {path: '@fastify/cookie', type: 'register', config: this.cookieOptions || {}},
      {path: '@fastify/formbody', type: 'register'},
      {
        path: '@fastify/multipart', type: 'register', config: merge(
          {attachFieldsToBody: 'keyValues'}, this.multipartOptions || {},
        ),
      },
      {path: '@fastify/session', type: 'register', config: this.sessionOptions || {}},
      {
        async handler(error: any) {
          if (error) throw error;
        },
        type: 'after',
      },
    ];
  }

  /**
   * Apply a middlewares to server instance
   * @param definitions - Middleware definitions
   *
   * @example
   * await Jii.app().get<Server>('server').applyMiddleware([
   *  { path: 'fastify-favicon', type: 'register' },
   *  { path: 'x-xss-protection', type: 'middleware' },
   *  {
   *    async handler(error: any) {
   *      if (error) throw error;
   *    },
   *    type: 'after',
   *  },
   *  {
   *    async handler(server: ServerInstance, options?: Record<string, any>) {
   *      // logic here
   *    },
   *    type: 'callback',
   *  },
   * ]);
   */
  public async applyMiddleware<T>(definitions: MiddlewareDefinition[]): Promise<void> {
    if (!definitions || !Array.isArray(definitions) || !definitions.length) {
      return;
    }

    for await (const {type, ...data} of definitions) {
      if (!MIDDLEWARE_TYPES.includes(type)) {
        throw new InvalidConfigError(`Unknown middleware type '${type}' given`);
      }

      if (type === 'register') {
        const params = <MiddlewareRegister<T>>data;
        await this._server.register(require(params.path), params.config || {});
      } else if (type === 'middleware') {
        const params = <MiddlewareMiddleware<T>>data;
        this._server.use(require(params.path)(params.config || {}));
      } else if (type === 'after') {
        await this._server.after((<MiddlewareAfter><unknown>data).handler);
      } else if (type === 'callback') {
        const params = <MiddlewareCallback<T>>data.handler;
        await params.handler(params?.config);
      }
    }
  }
}
