import { z } from 'zod';
import { ResourceDefinition } from './ResourceDefinition.js';

export type Resource<
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = { _flavor?: 'Resource' } & z.infer<TDefinition['schema']>;

export type Document<
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = SingleResourceDocument<TDefinition> | MultipleResourceDocument<TDefinition>;

export type SingleResourceDocument<
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = { data: Resource<TDefinition>; included?: Resource[] };

export type MultipleResourceDocument<
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = { data: Resource<TDefinition>[]; included?: Resource[] };
