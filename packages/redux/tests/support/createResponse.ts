import { Denormalized, QueryParams, ResourceDefinition } from 'agrajag';
import { createResponseBody } from './createResponseBody.js';

export function createResponse<TDefinition extends ResourceDefinition>(
  definition: TDefinition,
  data: Denormalized<TDefinition> | Denormalized<TDefinition>[],
  params: QueryParams = {},
) {
  return new Response(
    JSON.stringify(createResponseBody(definition, data, params)),
    {
      status: 200,
      headers: { 'Content-Type': 'application/vnd.api+json' },
    },
  );
}
