import qs from 'qs';
import { PageInfo } from '../application/Resolver.js';
import { TopLevelLinks } from '../serialization/Serializer.js';
import { DEFAULT_PAGE_SIZE } from './Pagination.js';
import { QueryParams } from './QueryParams.js';

/**
 * Build the JSON:API top-level pagination links for a collection from the
 * request params and the page's `PageInfo`. Links are relative (`/${type}?…`),
 * resolved by the client against its API base. Query is encoded the way the
 * server parses it (`qs` comma arrays), so links round-trip. Offset mode
 * (`page[number]`) yields first/prev/next/last; cursor mode yields next/prev.
 */
export function buildPageLinks(
  type: string,
  params: QueryParams,
  pageInfo: PageInfo,
  total?: number,
): TopLevelLinks {
  const base = `/${type}`;
  const urlFor = (pageOverride: Record<string, unknown>): string => {
    const query: Record<string, unknown> = {};
    if (params.include?.length) query.include = params.include;
    if (params.sort) query.sort = params.sort;
    if (params.filter) query.filter = params.filter;
    if (params.fields) query.fields = params.fields;

    const page: Record<string, unknown> = {};
    if (params.page?.size != null) page.size = params.page.size;
    Object.assign(page, pageOverride);
    if (Object.keys(page).length) query.page = page;

    const encoded = qs.stringify(query, { arrayFormat: 'comma', encodeValuesOnly: true });
    return encoded ? `${base}?${encoded}` : base;
  };

  // Offset mode: numbered links with a `last` when the total is known.
  if (params.page?.number != null) {
    const number = Math.max(1, Math.floor(params.page.number));
    const links: TopLevelLinks = { self: urlFor({ number }), first: urlFor({ number: 1 }) };
    if (number > 1) {
      links.prev = urlFor({ number: number - 1 });
    }
    if (pageInfo.hasNextPage) {
      links.next = urlFor({ number: number + 1 });
    }
    if (total != null && total > 0) {
      const size = params.page.size ?? DEFAULT_PAGE_SIZE;
      links.last = urlFor({ number: Math.max(1, Math.ceil(total / size)) });
    }
    return links;
  }

  // Cursor mode.
  const links: TopLevelLinks = {
    self: urlFor({
      ...(params.page?.after ? { after: params.page.after } : {}),
      ...(params.page?.before ? { before: params.page.before } : {}),
    }),
    first: urlFor({}),
  };
  if (pageInfo.hasNextPage && pageInfo.endCursor) {
    links.next = urlFor({ after: pageInfo.endCursor });
  }
  if (pageInfo.hasPreviousPage && pageInfo.startCursor) {
    links.prev = urlFor({ before: pageInfo.startCursor });
  }
  return links;
}
