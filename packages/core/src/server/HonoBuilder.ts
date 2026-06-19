import { Builder, BuilderOptions, DefinitionCollection } from 'agrajag';
import { HonoServerBuilder } from './HonoServerBuilder.js';
import { Hono } from 'hono';
import { Definitions } from '../api/Definitions.js';
import { IEndpointFactory } from '../endpoints/EndpointFactory.js';
import { OpenApiEndpointBuilderDecorator } from './OpenApiEndpointBuilderDecorator.js';
import { swaggerUI } from '@hono/swagger-ui';

type Factories<T extends Definitions> = {
  [K in keyof T]: IEndpointFactory<T[K]>;
};

// Duck-type instead of `instanceof Hono`. When the consumer's app is built
// with a different copy of `hono` than agrajag's (a duplicate in the
// dependency tree — easy to hit on a version bump), `instanceof Hono` is
// false even for a real Hono app. The constructor then treated the app as an
// options object, fell back to `new Hono()`, and silently registered every
// route onto a throwaway instance — the consumer's app 404s with no error.
function isHonoApp(
  value: Hono | (BuilderOptions & { hono?: Hono }),
): value is Hono {
  if (value instanceof Hono) {
    return true;
  }

  const candidate = value as Partial<Hono>;

  return (
    typeof candidate.route === 'function' &&
    typeof candidate.get === 'function' &&
    typeof candidate.fetch === 'function'
  );
}

export class HonoBuilder<
  TDefinitions extends Definitions = {},
> extends Builder<TDefinitions> {
  readonly #hono: Hono;

  constructor(honoOrOptions: Hono | (BuilderOptions & { hono?: Hono }) = {}) {
    const options = isHonoApp(honoOrOptions)
      ? { hono: honoOrOptions }
      : honoOrOptions;

    super(options);

    this.#hono = options.hono ?? new Hono();
  }

  addDefinitions<TNewDefinitions extends Definitions>(
    definitions: DefinitionCollection<TNewDefinitions>,
  ): HonoBuilder<TDefinitions & TNewDefinitions> {
    this.definitions.addDefinitions(definitions);

    return this as unknown as HonoBuilder<TDefinitions & TNewDefinitions>;
  }

  build(factories: Factories<TDefinitions>) {
    const honoServerBuilder = new HonoServerBuilder(this.#hono);
    const openApiDecorator = new OpenApiEndpointBuilderDecorator(
      honoServerBuilder,
    );

    this.addEndpointBuilder(openApiDecorator);

    for (const definition of this.definitions) {
      const endpoints = factories[definition.type].createEndpoints(
        definition as any,
        this.serializer,
      );

      this.addResource(definition, endpoints as any);
    }

    const openapi = openApiDecorator.build();
    this.#hono.get('/ui', swaggerUI({ url: '/', spec: openapi }));
    this.#hono.get('/openapi.json', c => c.json(openapi));

    return this.#hono;
  }
}
