import {
  ArrayPrimaryType,
  AttributesSchema,
  SinglePrimaryType,
  UpdateSchema,
} from '../resources/ResourceSchema.js';
import {
  AllCapabilitiesType,
  ResourceCapabilities,
  ResourceDefinition,
} from '../resources/ResourceDefinition.js';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import {
  ResourceLinkageSchema,
  ToManyLinkageSchema,
} from '../resources/ResourceLinkageSchema.js';
import { DeferredRelationships, UndeferredRelationships } from '../Builder.js';

export interface CreateSchemaOptions<
  TRelationships,
  TCapabilities extends ResourceCapabilities = AllCapabilitiesType,
> {
  relationships?: TRelationships;
  capabilities?: TCapabilities;
}

export interface SchemaFactory {
  createSchema<
    TType extends string = string,
    TAttributes extends AttributesSchema = AttributesSchema,
    TRelationships extends DeferredRelationships = DeferredRelationships,
  >(
    type: TType,
    attributesSchema: TAttributes,
    options?: CreateSchemaOptions<TRelationships>,
  ): ResourceDefinition<
    TType,
    TAttributes,
    UndeferredRelationships<TRelationships>
  >;

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
    options?: {
      optionalId?: boolean;
      partialAttributes?: boolean;
      withDenormalize?: boolean;
    },
  ): SinglePrimaryType<TDefinition>;

  createArrayPrimaryTypeSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    options?: {
      withDenormalize?: boolean;
    },
  ): ArrayPrimaryType<TDefinition>;

  createResourceSingleLinkageSchema(
    definition: ResourceDefinition,
  ): ResourceLinkageSchema;

  createResourceMultiLinkageSchema(
    definition: ResourceDefinition,
  ): ToManyLinkageSchema;

  /**
   * @deprecated Use createSinglePrimaryTypeSchema instead
   */
  createUpdateSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
  ): UpdateSchema<TDefinition>;
}
