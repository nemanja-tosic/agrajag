import { Before } from '@cucumber/cucumber';
import { Builder, HonoBuilder } from 'agrajag';
import { World } from '../../common/fetching-steps.js';

Before<World>(async function () {
  const honoBuilder = new HonoBuilder();

  this.builder = new Builder(honoBuilder);
  this.serverBuilder = honoBuilder;
  this.fetch = (path, request) => honoBuilder.build().request(path, request);
});
