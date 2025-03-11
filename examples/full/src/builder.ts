import { Builder, HonoBuilder, OpenApiEndpointBuilderDecorator } from 'agrajag';

export { z } from 'agrajag';

export const honoBuilder = new HonoBuilder();

export const openApiBuilder = new OpenApiEndpointBuilderDecorator(honoBuilder);

export const builder = new Builder();
