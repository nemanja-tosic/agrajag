import { Builder, HonoBuilder } from 'agrajag';

export const honoBuilder = new HonoBuilder();

export const builder = new Builder({ endpointBuilder: honoBuilder });
