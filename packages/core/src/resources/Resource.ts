import { z } from 'zod';
import { ResourceDefinition } from './ResourceDefinition.js';

export type Resource<
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = { _flavor?: 'Resource' } & z.infer<TDefinition['schema']>;
