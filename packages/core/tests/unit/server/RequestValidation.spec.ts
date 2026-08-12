import { Hono } from 'hono';
import { expect } from 'chai';
import { z } from 'zod';
import { createSchema } from '../../../src/schema/createSchema.js';
import { HonoBuilder } from '../../../src/server/HonoBuilder.js';
import { DefinitionCollection } from '../../../src/api/DefinitionCollection.js';
import type { BuilderOptions } from '../../../src/Builder.js';

// A request body that fails the resource's zod schema used to surface as an
// opaque 500 ("An unexpected error occurred") because the raw ZodError fell
// through to the generic handler. It is a client error: respond 400, and let
// the consumer decide whether the response names the offending fields.
describe('request body validation', () => {
  const echoFactory = {
    createEndpoints: () => ({
      create: { self: async (body: unknown) => body as never },
      patch: { self: async (body: unknown) => body as never },
    }),
  };

  const buildApp = (options: Partial<BuilderOptions> = {}) => {
    const things = createSchema('things', z.object({ name: z.string() }));
    return new HonoBuilder({ hono: new Hono(), ...options })
      .addDefinitions(new DefinitionCollection().addDefinition(things))
      .build({ things: echoFactory } as never);
  };

  const post = (app: Hono, body: unknown) =>
    app.request('/things', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

  const errorsOf = async (res: Response) =>
    ((await res.json()) as { errors: { detail: string }[] }).errors;

  it('responds 400, not an opaque 500, and logs the issues it hides', async () => {
    const captured: Error[] = [];
    const res = await post(
      buildApp({ logger: { error: e => void captured.push(e) } }),
      { data: { type: 'things', attributes: { name: 123 } } },
    );

    expect(res.status).to.equal(400);
    const [error] = await errorsOf(res);
    expect(error.detail).to.equal('Invalid request body');
    expect(captured).to.have.length(1);
    expect(String(captured[0])).to.contain('name');
  });

  it('names the offending field when exposeValidationIssues is on', async () => {
    const res = await post(buildApp({ exposeValidationIssues: true }), {
      data: { type: 'things', attributes: { name: 123 } },
    });

    expect(res.status).to.equal(400);
    const [error] = await errorsOf(res);
    expect(error.detail).to.contain('Invalid request body');
    expect(error.detail).to.contain('name');
  });

  it('still accepts a valid body', async () => {
    const res = await post(buildApp(), {
      data: { type: 'things', attributes: { name: 'ok' } },
    });

    expect(res.status).to.equal(201);
  });

  it('exposeErrorDetail also names endpoint throws on the Builder path', async () => {
    const things = createSchema('things', z.object({ name: z.string() }));
    const throwingFactory = {
      createEndpoints: () => ({
        create: {
          self: async () => {
            throw new Error('column does not exist');
          },
        },
      }),
    };
    const app = new HonoBuilder({
      hono: new Hono(),
      logger: { error: () => undefined },
      exposeErrorDetail: true,
    })
      .addDefinitions(new DefinitionCollection().addDefinition(things))
      .build({ things: throwingFactory } as never);

    const res = await post(app, {
      data: { type: 'things', attributes: { name: 'ok' } },
    });

    expect(res.status).to.equal(500);
    const [error] = await errorsOf(res);
    expect(error.detail).to.equal('Error: column does not exist');
  });

  it('responds 400 to an invalid PATCH body too', async () => {
    const app = buildApp();
    const res = await app.request('/things/1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: { type: 'wrong-type', id: '1' } }),
    });

    expect(res.status).to.equal(400);
  });
});
