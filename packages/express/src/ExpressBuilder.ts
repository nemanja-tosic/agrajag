import { Router, json, Request } from 'express';
import {
  EndpointSchema,
  ResourceDefinition,
  ServerBuilder,
  FetchDeleteHandler,
  MutationHandler,
  Response,
} from 'agrajag';

export class ExpressBuilder extends ServerBuilder {
  #express = Router();

  constructor() {
    super();

    this.#express.use(json());
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
    this.#express.get(path, async (req, res) => {
      const { body, status, headers } = await new Promise<Response>(resolve =>
        handler(this.#extractParams(req), async response => resolve(response)),
      );

      for (const [key, value] of Object.entries(headers ?? {})) {
        res.setHeader(key, value);
      }

      res.status(status).json(body);
    });

    return this;
  }

  addPost<TPath extends string, TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): this {
    this.#express.post(path, async (req, res) => {
      const { body, status, headers } = await new Promise<Response>(
        async resolve =>
          handler(await req.body, this.#extractParams(req), async response =>
            resolve(response),
          ),
      );

      for (const [key, value] of Object.entries(headers ?? {})) {
        res.setHeader(key, value);
      }

      res.status(status).json(body);
    });

    return this;
  }

  addPatch<TPath extends string, TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): this {
    this.#express.patch(path, async (req, res) => {
      const { body, status, headers } = await new Promise<Response>(
        async resolve =>
          handler(await req.body, this.#extractParams(req), async response =>
            resolve(response),
          ),
      );

      for (const [key, value] of Object.entries(headers ?? {})) {
        res.setHeader(key, value);
      }

      res.status(status).json(body);
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
    this.#express.delete(path, async (req, res) => {
      const { body, status, headers } = await new Promise<Response>(
        async resolve =>
          handler(await req.body, this.#extractParams(req), async response =>
            resolve(response),
          ),
      );

      for (const [key, value] of Object.entries(headers ?? {})) {
        res.setHeader(key, value);
      }

      res.status(status).json(body);
    });

    return this;
  }

  #extractParams(c: Request): any {
    return {
      ...c.params,
      include: c.query['include'],
      fields: Object.fromEntries(
        Object.entries(c.query)
          .filter(([key]) => key.match(/fields\[(.*?)\]/g))
          .map(([key, value]) => [key.match(/fields\[(.*?)\]/)![1], value]),
      ),
      sort: c.query['sort'],
    };
  }

  build() {
    return this.#express;
  }
}
