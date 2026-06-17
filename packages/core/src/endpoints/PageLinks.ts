import qs from 'qs';
import { PageInfo } from '../application/Resolver.js';
import { TopLevelLinks } from '../serialization/Serializer.js';
import { QueryParams } from './QueryParams.js';

/**
 * Build the JSON:API top-level pagination links for a collection from the
 * request params and the page's `PageInfo`. Links are relative (`/${type}?…`),
 * resolved by the client against its API base. Query is encoded the way the
 * server parses it (`qs` comma arrays), so links round-trip.
 */
export function buildPageLinks(
  type: string,
  params: QueryParams,
  pageInfo: PageInfo,
): TopLevelLinks {
  const base = `/${type}`;
  const link = (cursor: { after?: string; before?: string }): string => {
    const query: Record<string, unknown> = {};
    if (params.include?.length) query.include = params.include;
    if (params.sort) query.sort = params.sort;
    if (params.filter) query.filter = params.filter;
    if (params.fields) query.fields = params.fields;

    const page: Record<string, unknown> = {};
    if (params.page?.size != null) page.size = params.page.size;
    if (cursor.after) page.after = cursor.after;
    if (cursor.before) page.before = cursor.before;
    if (Object.keys(page).length) query.page = page;

    const encoded = qs.stringify(query, { arrayFormat: 'comma', encodeValuesOnly: true });
    return encoded ? `${base}?${encoded}` : base;
  };

  const links: TopLevelLinks = {
    self: link({ after: params.page?.after, before: params.page?.before }),
    first: link({}),
  };
  if (pageInfo.hasNextPage && pageInfo.endCursor) {
    links.next = link({ after: pageInfo.endCursor });
  }
  if (pageInfo.hasPreviousPage && pageInfo.startCursor) {
    links.prev = link({ before: pageInfo.startCursor });
  }
  return links;
}
