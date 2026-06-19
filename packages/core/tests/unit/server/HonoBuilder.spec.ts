import { Hono } from 'hono';
import { expect } from 'chai';
import { HonoBuilder } from '../../../src/server/HonoBuilder.js';

// Regression for the duplicate-`hono` footgun: when the consumer's app is
// built with a different copy of `hono` than agrajag's, `instanceof Hono` is
// false even for a real Hono app. The constructor used to fall back to
// `new Hono()` and silently register every route onto a throwaway instance,
// so the consumer's app 404s with no error.
describe('HonoBuilder app selection', () => {
  it('builds onto the Hono instance it is given', async () => {
    const app = new Hono();

    const built = new HonoBuilder(app).build({});

    expect(built).to.equal(app);
    const res = await app.request('/openapi.json');
    expect(res.status).to.equal(200);
  });

  it('builds onto a Hono-like app from a different hono copy (not instanceof)', async () => {
    const real = new Hono();
    // A real Hono app reached through a different `hono` copy fails
    // `instanceof Hono`; emulate that with a delegating object that is
    // Hono-like (route/get/fetch) but not an instance of agrajag's Hono.
    const foreign = {
      route: real.route.bind(real),
      get: real.get.bind(real),
      fetch: real.fetch.bind(real),
    } as unknown as Hono;

    expect(foreign instanceof Hono).to.equal(false);

    const built = new HonoBuilder(foreign).build({});

    expect(built).to.equal(foreign);
    // Routes must land on the underlying app, not a throwaway Hono.
    const res = await real.request('/openapi.json');
    expect(res.status).to.equal(200);
  });

  it('still falls back to a fresh Hono when given options without an app', async () => {
    const built = new HonoBuilder({}).build({});

    expect(built).to.be.instanceOf(Hono);
    const res = await built.request('/openapi.json');
    expect(res.status).to.equal(200);
  });
});
