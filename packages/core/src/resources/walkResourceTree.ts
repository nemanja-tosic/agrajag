import { unwrapRelationship } from '../endpoints/QueryParams.js';
import { ResourceDefinition } from './ResourceDefinition.js';

export function* walkResourceTree(
  definition: ResourceDefinition | undefined,
): Generator<[string, ResourceDefinition | [ResourceDefinition]]> {
  if (!definition) {
    return;
  }

  const queue: [string, ResourceDefinition | [ResourceDefinition]][] = [
    [definition.type, definition],
  ];
  const visited = new Set<string>();

  let current: [string, ResourceDefinition | [ResourceDefinition]] | undefined;
  while ((current = queue.shift()) != undefined) {
    yield current;

    if (visited.has(current[0])) {
      continue;
    } else {
      visited.add(current[0]);
    }

    queue.unshift(
      ...Object.entries(unwrapRelationship(current[1]).relationships),
    );
  }
}
