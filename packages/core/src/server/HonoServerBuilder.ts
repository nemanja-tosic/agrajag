import { Hono } from 'hono';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import {
  ServerBuilder,
  FetchDeleteHandler,
  MutationHandler,
  Response,
} from './ServerBuilder.js';
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
    this.#hono.get(path, async c => {
      const { body, status, headers } = await new Promise<Response>(resolve =>
        handler(this.#extractParams(c), async response => resolve(response)),
      );

      return c.json(body, status, headers);
    });

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

      const { body, status, headers } = await new Promise<Response>(resolve =>
        handler(parsed.body, this.#extractParams(c), async response =>
          resolve(response),
        ),
      );

      return c.json(body, status, headers);
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

      const { body, status, headers } = await new Promise<Response>(resolve =>
        handler(parsed.body, this.#extractParams(c), async response =>
          resolve(response),
        ),
      );

      return c.json(body, status, headers);
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

      const { body, status, headers } = await new Promise<Response>(resolve =>
        handler(deleteBody, this.#extractParams(c), async response =>
          resolve(response),
        ),
      );

      return c.json(body, status, headers);
    });

    return this;
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

    return {
      ...c.req.param(),
      ...qs.parse(query, { comma: true }),
      filter,
      user: c.get('user'),
    };
  }

  build(): Hono {
    return this.#hono;
  }
}
