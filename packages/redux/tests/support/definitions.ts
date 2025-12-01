import { DefinitionCollection } from 'agrajag';
import { user, comments } from './schema.js';

export const definitions = new DefinitionCollection()
  .addDefinition(user)
  .addDefinition(comments);
