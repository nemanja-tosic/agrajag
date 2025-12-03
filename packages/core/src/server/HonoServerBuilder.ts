import { Hono } from 'hono';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import {
  ServerBuilder,
  FetchDeleteHandler,
  MutationHandler,
  Response,
} from './ServerBuilder.js';

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
      const { body, status, headers } = await new Promise<Response>(
        async resolve =>
          handler(await c.req.json(), this.#extractParams(c), async response =>
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
      const { body, status, headers } = await new Promise<Response>(
        async resolve =>
          handler(await c.req.json(), this.#extractParams(c), async response =>
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
      const { body, status, headers } = await new Promise<Response>(
        async resolve =>
          handler(
            c.req.header('content-type') === 'application/json'
              ? await c.req.json()
              : undefined,
            this.#extractParams(c),
            async response => resolve(response),
          ),
      );

      return c.json(body, status, headers);
    });

    return this;
  }

  #extractParams(c: any): any {
    return {
      ...c.req.param(),
      include: c.req.query('include'),
      fields: Object.fromEntries(
        Object.entries(c.req.query())
          .filter(([key]) => key.match(/fields\[(.*?)\]/g))
          .map(([key, value]) => [key.match(/fields\[(.*?)\]/)![1], value]),
      ),
      sort: c.req.query('sort'),
      filter: c.req.query('filter'),
      user: c.req.user,
    };
  }

  build(): Hono {
    return this.#hono;
  }
}
