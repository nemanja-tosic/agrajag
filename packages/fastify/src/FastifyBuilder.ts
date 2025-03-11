import Fastify, {
  fastify,
  FastifyInstance,
  FastifyRegister,
  FastifyRequest,
} from 'fastify';
import {
  EndpointSchema,
  ResourceDefinition,
  ServerBuilder,
  FetchDeleteHandler,
  MutationHandler,
  Response,
  Server,
} from 'agrajag';

export { ServerBuilder } from 'agrajag';

export class FastifyBuilder extends ServerBuilder<FastifyInstance> {
  #fastify = Fastify();

  constructor() {
    super();

    this.#fastify.addContentTypeParser(
      'application/vnd.api+json',
      { parseAs: 'string' },
      (req: FastifyRequest, body: string, done) => {
        try {
          done(null, JSON.parse(body));
        } catch (error) {
          done(error as Error);
        }
      },
    );
  }

  addGet<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    schema: TDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ): this {
    this.#fastify.route({
      method: 'GET',
      url: path,
      handler: async (req, res) => {
        const { body, status, headers } = await new Promise<Response>(resolve =>
          handler(this.#extractParams(req), async response =>
            resolve(response),
          ),
        );

        for (const [key, value] of Object.entries(headers ?? {})) {
          res.header(key, value);
        }

        res.status(status).send(body);
      },
    });

    return this;
  }

  addPost<TPath extends string = string>(
    schema: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): this {
    this.#fastify.route({
      method: 'POST',
      url: path,
      handler: async (req, res) => {
        const { body, status, headers } = await new Promise<Response>(
          async resolve =>
            handler(await req.body, this.#extractParams(req), async response =>
              resolve(response),
            ),
        );

        for (const [key, value] of Object.entries(headers ?? {})) {
          res.header(key, value);
        }

        res.status(status).send(body);
      },
    });

    return this;
  }

  addPatch<TPath extends string = string>(
    schema: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): this {
    this.#fastify.route({
      method: 'PATCH',
      url: path,
      handler: async (req, res) => {
        const { body, status, headers } = await new Promise<Response>(
          async resolve =>
            handler(await req.body, this.#extractParams(req), async response =>
              resolve(response),
            ),
        );

        for (const [key, value] of Object.entries(headers ?? {})) {
          res.header(key, value);
        }

        res.status(status).send(body);
      },
    });

    return this;
  }

  addDelete<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    schema: TDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): this {
    this.#fastify.route({
      method: 'DELETE',
      url: path,
      handler: async (req, res) => {
        const { body, status, headers } = await new Promise<Response>(
          async resolve =>
            handler(await req.body, this.#extractParams(req), async response =>
              resolve(response),
            ),
        );

        for (const [key, value] of Object.entries(headers ?? {})) {
          res.header(key, value);
        }

        res.status(status).send(body);
      },
    });

    return this;
  }

  #extractParams(c: any): any {
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

  build(): FastifyInstance {
    return this.#fastify;
  }
}
