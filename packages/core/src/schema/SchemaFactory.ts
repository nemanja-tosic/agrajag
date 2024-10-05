import {
  ArrayPrimaryType,
  AttributesSchema,
  SinglePrimaryType,
  UpdateSchema,
} from '../resources/ResourceSchema.js';
import {
  ResourceCapabilities,
  ResourceDefinition,
  ResourceRelationships,
} from '../resources/ResourceDefinition.js';
import { z } from 'zod';
import { EndpointSchema } from '../endpoints/Endpoints.js';

export interface CreateSchemaOptions<
  TRelationships extends ResourceRelationships,
> {
  relationships?: TRelationships;
  capabilities?: ResourceCapabilities;
}

export interface SchemaFactory {
  createSchema<
    TAttributes extends AttributesSchema = AttributesSchema,
    TRelationships extends ResourceRelationships = ResourceRelationships,
  >(
    type: string,
    createAttributesSchema: (zod: typeof z) => TAttributes,
    options?: CreateSchemaOptions<TRelationships>,
  ): ResourceDefinition<TAttributes, TRelationships>;

  createEndpointSchema(options?: {
    responseSchema?: any;
    requestSchema?: any;
    noId?: boolean;
  }): EndpointSchema;

  createSinglePrimaryTypeSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    options?: { optionalId?: boolean; partialAttributes?: boolean },
  ): SinglePrimaryType<TDefinition>;

  createArrayPrimaryTypeSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
  ): ArrayPrimaryType<TDefinition>;

  createUpdateSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
  ): UpdateSchema<TDefinition>;
}
