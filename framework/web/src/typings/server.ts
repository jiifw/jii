/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// types
import {FastifyInstance, FastifyRequest, FastifyReply, FastifyHttpOptions} from 'fastify';
import {Handler} from '@fastify/middie';

export interface URIComponent {
  scheme?: string;
  userinfo?: string;
  host?: string;
  port?: number | string;
  path?: string;
  query?: string;
  fragment?: string;
  reference?: string;
  error?: string;
}

declare namespace server {
  export type ServerInstance<T = FastifyInstance> = Partial<
    FastifyInstance
    & T
    & MiddlewareEngine & {
    [key: string]: any;
  }
  >;

  export type ServerRequest<T = FastifyRequest> = Partial<FastifyRequest>
    & T
    & {
    [key: string]: any;
  };

  export type ServerReply<T = FastifyReply> = Partial<FastifyReply
    & T
    & {
    [key: string]: any;
  }
  >;

  export type ServerHTTPOptions<T = FastifyHttpOptions<undefined>> = Partial<FastifyHttpOptions<undefined>
    & T
    & {
    [key: string]: any;
  }
  >;
}

interface MiddlewareEngine {
  use(fn: Handler): ThisType<ServerInstance>;
  use(route: string, fn: Handler): ThisType<ServerInstance>;
  use(routes: string[], fn: Handler): ThisType<ServerInstance>;
}

export interface ServerInstance extends server.ServerInstance {
}

export interface ServerRequest extends server.ServerRequest {
  urlData?(): URIComponent;
}

export interface ServerReply extends server.ServerReply {
}

export interface ServerHTTPOptions extends server.ServerHTTPOptions {
}
