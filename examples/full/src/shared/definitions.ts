import { DefinitionCollection } from 'agrajag';
import { article, author, comment } from './schema.js';

export const definitions = new DefinitionCollection()
  .addDefinition(article)
  .addDefinition(author)
  .addDefinition(comment);
