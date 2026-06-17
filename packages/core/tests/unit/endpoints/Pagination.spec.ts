import { expect } from 'chai';
import { encodeCursor, decodeCursor, paginate, buildPageLinks } from 'agrajag';

const rows = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];

describe('cursor encode/decode', () => {
  it('round-trips a payload', () => {
    const cursor = encodeCursor({ values: ['2026-01-01', 7], id: 'abc' });
    expect(decodeCursor(cursor)).to.deep.equal({ values: ['2026-01-01', 7], id: 'abc' });
  });

  it('produces a url-safe opaque string', () => {
    const cursor = encodeCursor({ values: ['a/b+c'], id: 'x' });
    expect(cursor).to.match(/^[A-Za-z0-9_-]+$/);
  });
});

describe('paginate (in-memory cursor)', () => {
  it('returns the first page when no cursor is given', () => {
    const page = paginate(rows, { size: 2 });
    expect(page.data.map(r => r.id)).to.deep.equal(['1', '2']);
    expect(page.pageInfo.hasNextPage).to.equal(true);
    expect(page.pageInfo.hasPreviousPage).to.equal(false);
    expect(page.total).to.equal(5);
    expect(page.pageInfo.endCursor).to.be.a('string');
  });

  it('walks forward with page[after]', () => {
    const first = paginate(rows, { size: 2 });
    const next = paginate(rows, { size: 2, after: first.pageInfo.endCursor });
    expect(next.data.map(r => r.id)).to.deep.equal(['3', '4']);
    expect(next.pageInfo.hasPreviousPage).to.equal(true);
    expect(next.pageInfo.hasNextPage).to.equal(true);
  });

  it('reports the last page', () => {
    const last = paginate(rows, { size: 2, after: encodeCursor({ values: [], id: '4' }) });
    expect(last.data.map(r => r.id)).to.deep.equal(['5']);
    expect(last.pageInfo.hasNextPage).to.equal(false);
  });

  it('walks backward with page[before]', () => {
    const prev = paginate(rows, { size: 2, before: encodeCursor({ values: [], id: '3' }) });
    expect(prev.data.map(r => r.id)).to.deep.equal(['1', '2']);
    expect(prev.pageInfo.hasPreviousPage).to.equal(false);
    expect(prev.pageInfo.hasNextPage).to.equal(true);
  });

  it('handles an empty set', () => {
    const page = paginate([], { size: 2 });
    expect(page.data).to.deep.equal([]);
    expect(page.pageInfo).to.deep.include({ hasNextPage: false, hasPreviousPage: false });
    expect(page.pageInfo.startCursor).to.equal(undefined);
  });
});

describe('buildPageLinks (cursor)', () => {
  it('emits self/first and next when there is a next page', () => {
    const links = buildPageLinks('tags', { page: { size: 2 } }, {
      endCursor: 'END',
      hasNextPage: true,
      hasPreviousPage: false,
    });
    expect(links.first).to.equal('/tags?page[size]=2');
    expect(links.next).to.equal('/tags?page[size]=2&page[after]=END');
    expect(links.prev).to.equal(undefined);
  });

  it('emits prev when there is a previous page and preserves sort', () => {
    const links = buildPageLinks('tags', { sort: '-createdAt' as never, page: { size: 2 } }, {
      startCursor: 'START',
      hasNextPage: false,
      hasPreviousPage: true,
    });
    expect(links.prev).to.equal('/tags?sort=-createdAt&page[size]=2&page[before]=START');
    expect(links.next).to.equal(undefined);
  });
});
