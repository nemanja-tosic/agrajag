import { Hono, Context } from 'hono';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import {
  ServerBuilder,
  FetchDeleteHandler,
  MutationHandler,
  Response,
} from './ServerBuilder.js';
import { createErrorResponse } from './errorResponse.js';
import * as qs from 'qs';

export class HonoServerBuilder extends ServerBuilder {
  #hono = new Hono();

  constructor(hono: Hono) {
    super();

    this.#hono = hono;
  }

  addGet<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    schema: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ): this {
    this.#hono.get(path, c =>
      this.#run(c, respond => handler(this.#extractParams(c), respond)),
    );

    return this;
  }

  addPost<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    schema: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): this {
    this.#hono.post(path, async c => {
      const parsed = await this.#parseBody(c);
      if (!parsed.ok) return c.json(parsed.error, 400);

      return this.#run(c, respond =>
        handler(parsed.body, this.#extractParams(c), respond),
      );
    });

    return this;
  }

  addPatch<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    schema: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): this {
    this.#hono.patch(path, async c => {
      const parsed = await this.#parseBody(c);
      if (!parsed.ok) return c.json(parsed.error, 400);

      return this.#run(c, respond =>
        handler(parsed.body, this.#extractParams(c), respond),
      );
    });

    return this;
  }

  addDelete<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    schema: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): this {
    this.#hono.delete(path, async c => {
      let deleteBody: unknown;
      if (c.req.header('content-type') === 'application/json') {
        const parsed = await this.#parseBody(c);
        if (!parsed.ok) return c.json(parsed.error, 400);
        deleteBody = parsed.body;
      }

      return this.#run(c, respond =>
        handler(deleteBody, this.#extractParams(c), respond),
      );
    });

    return this;
  }

  // A handler that throws (or rejects) before calling `respond` used to leave
  // the response promise unsettled forever: the request hung and the rejection
  // escaped as an unhandledRejection. Chain the handler's own promise into the
  // response promise so a throw settles the request with an error response.
  async #run(
    c: Context,
    run: (respond: (response: Response) => Promise<void>) => Promise<void>,
  ): Promise<globalThis.Response> {
    try {
      const response = await new Promise<Response>((resolve, reject) => {
        run(async r => void resolve(r)).catch(reject);
      });

      return this.#respond(c, response);
    } catch (error) {
      return this.#respond(c, createErrorResponse(error as Error));
    }
  }

  // A 204 (No Content) response must not carry a body, so it cannot go
  // through `c.json` (which only accepts contentful status codes). Route it
  // to `c.body(null, ...)` instead.
  #respond(
    c: Context,
    { body, status, headers }: Response,
  ): globalThis.Response {
    if (status === 204) {
      return c.body(null, status, headers);
    }

    return c.json(body, status, headers);
  }

  // Parsing must happen OUTSIDE the `new Promise(async resolve => ...)`
  // executor: a rejection inside an async executor is not propagated to the
  // outer promise, so a body-less or malformed-JSON request became an
  // unhandled rejection that killed the whole process.
  async #parseBody(
    c: any,
  ): Promise<{ ok: true; body: unknown } | { ok: false; error: object }> {
    try {
      return { ok: true, body: await c.req.json() };
    } catch {
      return {
        ok: false,
        error: {
          errors: [
            {
              status: '400',
              title: 'Bad Request',
              detail: 'Request body is not valid JSON',
            },
          ],
        },
      };
    }
  }

  #extractParams(c: any): any {
    const { filter, ...query } = c.req.query();
    const parsed = qs.parse(query, { comma: true }) as Record<string, unknown>;
    const context = { ...c.var };

    if (typeof parsed.include === 'string') {
      parsed.include = parsed.include.split(',');
    }

    return {
      ...c.req.param(),
      ...parsed,
      filter,
      user: context.user,
      context,
    };
  }

  build(): Hono {
    return this.#hono;
  }
}
