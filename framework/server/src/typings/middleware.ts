/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

/** Middleware packages */
export enum MiddlewarePackage {
  FavIcon = 'fastify-favicon',
  GracefulShutdown = 'fastify-graceful-shutdown',
  Accepts = '@fastify/accepts',
  UrlData = '@fastify/url-data',
  Cookie = '@fastify/cookie',
  Formbody = '@fastify/formbody',
  Multipart = '@fastify/multipart',
}

/** Middleware middlewares' */
export enum MiddlewareMiddleware {
  XssProtection = 'x-xss-protection',
}

/** Middleware plugins */
export enum MiddlewarePlugin {
  /*CORS = '@framework/plugins/cors',
  RateLimit = '@framework/plugins/rate-limit',
  AutoControllers = '@framework/plugins/auto-controllers',
  AutoModules = '@framework/plugins/auto-modules',
  Swagger = '@framework/plugins/swagger',
  Session = '@framework/plugins/session',
  AccessToken = '@framework/plugins/access-token',
  Jwt = '@framework/plugins/jwt',
  I18n = '@framework/plugins/i18n',
  Authenticate = '@framework/plugins/authenticate',*/
}

/** Core middleware paths */
export type Middleware =
  Lowercase<
    typeof MiddlewarePackage [keyof typeof MiddlewarePackage]
    | typeof MiddlewareMiddleware [keyof typeof MiddlewareMiddleware]
    | typeof MiddlewarePlugin [keyof typeof MiddlewarePlugin]
    | string
  >;

