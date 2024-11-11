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
    TType extends string = string,
    TAttributes extends AttributesSchema = AttributesSchema,
    TRelationships extends ResourceRelationships = ResourceRelationships,
  >(
    type: TType,
    createAttributesSchema: (zod: typeof z) => TAttributes,
    options?: CreateSchemaOptions<TRelationships>,
  ): ResourceDefinition<TType, TAttributes, TRelationships>;

  createEndpointSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    options?: { responseSchema?: any; requestSchema?: any; noId?: boolean },
  ): EndpointSchema;

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

  /**
   * @deprecated Use createSinglePrimaryTypeSchema instead
   */
  createUpdateSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
  ): UpdateSchema<TDefinition>;
}
