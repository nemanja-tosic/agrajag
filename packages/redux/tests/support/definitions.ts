import { DefinitionCollection } from 'agrajag';
import { user } from './schema.js';

export const definitions = new DefinitionCollection().addDefinition(user);
