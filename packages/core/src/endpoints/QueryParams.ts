import { ResourceDefinition } from '../resources/ResourceDefinition.js';

export type QueryParams<
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = {
  // TODO: should be based on TDefinition
  include?: string;
  fields?: Prettify<Partial<Fields<TDefinition, TDefinition['type']>>>;
  sort?: TDefinition['attributes'];
  filter?: string;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type Fields<
  TDefinition extends ResourceDefinition,
  Path extends string = '',
  // TODO: replace depth with matching with include
  Depth extends number = 5,
> = Depth extends 0
  ? {}
  : {
      [K in Path]: TDefinition['attributes'];
    } & (RelationshipKeys<TDefinition> extends never
      ? {}
      : {
          [K in RelationshipKeys<TDefinition>]: Fields<
            UnwrapRelationship<TDefinition['relationships'][K]>,
            `${Path}.${K}`,
            Prev<Depth>
          >;
        }[RelationshipKeys<TDefinition>]);

type RelationshipKeys<T extends ResourceDefinition> = Extract<
  keyof T['relationships'],
  string
>;

type UnwrapRelationship<T extends ResourceDefinition | ResourceDefinition[]> =
  T extends ResourceDefinition
    ? T
    : T extends ResourceDefinition[]
      ? T[number]
      : never;

type Prev<N extends number> = N extends 5
  ? 4
  : N extends 4
    ? 3
    : N extends 3
      ? 2
      : N extends 2
        ? 1
        : 0;
