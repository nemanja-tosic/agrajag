import { Denormalized, ResourceDefinition } from 'agrajag';

export function createDenormalized<TDefinition extends ResourceDefinition>(
  definition: TDefinition,
  data: Denormalized<TDefinition>,
): Denormalized<TDefinition>;
export function createDenormalized<TDefinition extends ResourceDefinition>(
  definition: TDefinition,
  data: Denormalized<TDefinition>[],
): Denormalized<TDefinition>[];
export function createDenormalized<TDefinition extends ResourceDefinition>(
  definition: TDefinition,
  data: Denormalized<TDefinition> | Denormalized<TDefinition>[],
): Denormalized<TDefinition> | Denormalized<TDefinition>[] {
  return data;
}
