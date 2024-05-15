import { Hono } from 'hono';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import {
  ServerBuilder,
  FetchHandler,
  MutationHandler,
  Response,
} from './ServerBuilder.js';

export class HonoBuilder extends ServerBuilder {
  #hono = new Hono();

  addGet<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    schema: TDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: FetchHandler<TPath, TDefinition>,
  ): this {
    this.#hono.get(path, async c => {
      const { body, status, headers } = await new Promise<Response>(resolve =>
        handler(this.#extractParams(c), async response => resolve(response)),
      );

      return c.json(body, status, headers);
    });

    return this;
  }

  addPost<TPath extends string = string>(
    schema: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
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

  addPatch<TPath extends string = string>(
    schema: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
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

  addDelete<TPath extends string = string>(
    schema: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): this {
    this.#hono.delete(path, async c => {
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

  #extractParams(c: any): any {
    return {
      ...(c.req.param() as any),
      include: c.req.query('include'),
      fields: Object.fromEntries(
        Object.entries(c.req.query())
          .filter(([key]) => key.match(/fields\[(.*?)\]/g))
          .map(([key, value]) => [key.match(/fields\[(.*?)\]/)![1], value]),
      ),
      sort: c.req.query('sort'),
    };
  }

  build() {
    return this.#hono;
  }
}
