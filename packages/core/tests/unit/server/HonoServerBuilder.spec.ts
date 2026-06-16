import { Hono } from 'hono';
import { expect } from 'chai';
import { HonoServerBuilder } from '../../../src/server/HonoServerBuilder.js';
import type { EndpointSchema } from '../../../src/endpoints/Endpoints.js';
import type { ResourceDefinition } from '../../../src/resources/ResourceDefinition.js';

// Regression for the fatal body-parse bug: `await c.req.json()` used to run
// inside `new Promise(async resolve => …)` executors, where a rejection does
// not propagate — a body-less or malformed-JSON POST/PATCH became an
// unhandledRejection that killed the whole process (and the route hung).
describe('HonoServerBuilder body parsing', () => {
  const stubSchema = {} as ResourceDefinition;
  const stubEndpointSchema = () => ({}) as EndpointSchema;

  const buildApp = () => {
    const builder = new HonoServerBuilder(new Hono());
    builder.addPost(stubSchema, stubEndpointSchema, '/things', (body, _params, respond) =>
      respond({ body: { data: { type: 'things', id: '1' } }, status: 201 }),
    );
    builder.addPatch(stubSchema, stubEndpointSchema, '/things/:id', (body, _params, respond) =>
      respond({ body: { data: { type: 'things', id: String(body ? 1 : 0) } }, status: 200 }),
    );
    return builder.build();
  };

  it('responds 400 to a body-less POST instead of dying with an unhandled rejection', async () => {
    const rejections: unknown[] = [];
    const onRejection = (reason: unknown) => void rejections.push(reason);
    process.on('unhandledRejection', onRejection);
    try {
      // pre-fix: this await never resolved (mocha timeout) and the rejection
      // escaped to the process
      const response = await buildApp().request('/things', { method: 'POST' });
      expect(response.status).to.equal(400);
      await new Promise(resolve => setImmediate(resolve));
      expect(rejections).to.have.length(0);
    } finally {
      process.off('unhandledRejection', onRejection);
    }
  });

  it('responds 400 to malformed JSON on PATCH', async () => {
    const response = await buildApp().request('/things/1', {
      method: 'PATCH',
      body: '{not json',
      headers: { 'content-type': 'application/json' },
    });
    expect(response.status).to.equal(400);
  });

  it('still parses valid JSON bodies', async () => {
    const response = await buildApp().request('/things', {
      method: 'POST',
      body: JSON.stringify({ a: 1 }),
      headers: { 'content-type': 'application/json' },
    });
    expect(response.status).to.equal(201);
    expect(await response.json()).to.deep.equal({ data: { type: 'things', id: '1' } });
  });
});
