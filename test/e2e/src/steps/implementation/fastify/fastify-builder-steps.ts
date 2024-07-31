import { After, Before } from '@cucumber/cucumber';
import { Builder } from 'agrajag';
import { FastifyBuilder } from '@agrajag/fastify-adapter';
import { World } from '../../common/fetching-steps.js';
import { createServer } from 'node:http';
import { AddressInfo } from 'node:net';

Before<World>(async function () {
  const fastifyBuilder = new FastifyBuilder();
  const server = createServer();

  const addressInfo = await new Promise<AddressInfo>(resolve =>
    server.listen(undefined, undefined, () =>
      resolve(server.address() as AddressInfo),
    ),
  );

  this.listen = async () => {
    await fastifyBuilder.build().listen({
      host: '127.0.0.1',
      port: addressInfo.port,
    });
  };

  this.builder = new Builder(fastifyBuilder);
  this.serverBuilder = fastifyBuilder;
  this.fetch = (path, request) => {
    return fetch(`http://127.0.0.1:${addressInfo.port}${path}`, request);
  };

  this.cleanup = [
    ...(this.cleanup ?? []),
    async () => {
      await fastifyBuilder.build().close();
    },
    async () =>
      new Promise((resolve, reject) => {
        server.close(err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }),
  ];
});

After<World>(async function () {
  await Promise.all(this.cleanup?.map(cb => cb()) ?? []);
});
