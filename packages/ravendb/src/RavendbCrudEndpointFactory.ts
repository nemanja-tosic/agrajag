import {
  Denormalized,
  EndpointFactory,
  Normalized,
  Resolver,
  ResourceDefinition,
} from 'agrajag';
import { IDocumentStore } from 'ravendb';

export class RavendbCrudEndpointFactory<
  TDefinition extends ResourceDefinition,
> extends EndpointFactory<TDefinition> {
  constructor(private documentStore: IDocumentStore) {
    super();
  }

  protected createExternal(definition: TDefinition): Resolver<TDefinition> {
    const session = this.documentStore.openSession();

    return {
      byId: async idOrIds => {
        const query = session.advanced
          .rawQuery<Normalized<TDefinition> | Normalized<TDefinition>[]>(
            `
              from @all_docs where ID() in ($id)
            `,
          )
          .waitForNonStaleResults()
          .addParameter('id', idOrIds);

        if (Array.isArray(idOrIds)) {
          return query.all() as any;
        } else {
          return query.singleOrNull().then(r => r ?? undefined);
        }
      },
      byType: (type, { sort } = {}) => {
        const query = session.query<Normalized<TDefinition>>({
          collection: type,
        });

        if (sort) {
          if (sort.toString().startsWith('-')) {
            query.orderByDescending(sort.toString().substring(1));
          } else if(sort.toString().includes('.')) {
            //node: nested sorting not supported
            return undefined;
          }
          else {
            query.orderBy(sort.toString());
          }
        }

        return query.all();
      },
      relationshipByKey: async (id, key) => {
        const query = session.advanced
          .rawQuery<Denormalized<TDefinition>>(
            `
              ${getRelationship}

              from "${definition.type}" as e
              where ID() = $id
              select getRelationship(e, $key)
            `,
          )
          .addParameter('id', id)
          .addParameter('key', key);

        if (Array.isArray(definition.relationships[key])) {
          return query.all() as any;
        } else {
          return query.singleOrNull().then(r => r ?? undefined);
        }
      },
      saveUow: () => session.saveChanges(),
      delete: entity => session.delete(entity.id),
      save: entity =>
        session.store(
          Object.assign(entity, {
            '@metadata': {
              ...entity['@metadata'],
              '@collection': definition.type,
            },
          }),
        ),
      [Symbol.asyncDispose]: async () => session.dispose(),
    };
  }
}

const denormalize = `
  declare function denormalize(entity) {
    const properties = Object.fromEntries(
      Object.entries(entity).map(([key, value]) =>
        key.endsWith('Id') || key.endsWith('Ids')
        ? [
            key.replace(/Id(s)?$/, ''),
            Array.isArray(value)
              ? load(value).map(v => Object.assign({ id: id(v) }, v))
              : Object.assign({ id: value }, load(value))
          ]
       : [key, value]
      )
    );
    
    return Object.assign({ id: id(entity) }, properties);
  }
`;

const getRelationship = `
  declare function getRelationship(entity, key) {
    if (entity[\`\${key}Id\`] !== undefined) {
      const relationship = load(entity[\`\${key}Id\`]);
      if (relationship == null) {
        return [];
      }
      
      return {
        id: id(relationship),
        type: relationship['@metadata']['@collection']
      };
    } else if (entity[\`\${key}Ids\`] !== undefined) {
      const relationships = load(entity[\`\${key}Ids\`]);
      
      return relationships
        .filter(relationship => relationship != null)
        .map(relationship => ({
          id: id(relationship),
          type: relationship['@metadata']['@collection']
        }));
    }
    
    return [];
  }
`;
