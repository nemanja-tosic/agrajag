import { expect } from 'chai';
import { z, createSchema, ResourceCapabilities, DefinitionCollection } from 'agrajag';
import { McpBuilder, type GeneratedTool, type McpWriteOptions } from '../../src/index.js';

interface Call {
  url: string;
  init?: RequestInit;
}

function stubClient(body = '{"data":[]}') {
  const calls: Call[] = [];
  return {
    calls,
    request(url: string, init?: RequestInit) {
      calls.push({ url, init });
      return Promise.resolve(new Response(body, { status: 200 }));
    },
  };
}

const author = createSchema('authors', z.object({ name: z.string() }), {
  relationships: { articles: () => [article], editor: () => author },
});
const article = createSchema('articles', z.object({ body: z.string() }), {
  relationships: { author: () => author },
});

const ALL_WRITES: McpWriteOptions = {
  create: true,
  update: true,
  delete: true,
  relationships: true,
};

function build(
  definitions: ReturnType<typeof createSchema>[],
  http = stubClient(),
  writes: McpWriteOptions = ALL_WRITES,
  namePrefix = 'blog',
) {
  const collection = new DefinitionCollection();
  for (const definition of definitions) {
    collection.addDefinition(definition);
  }
  const tools = new McpBuilder()
    .addDefinitions(collection)
    .build({ namePrefix, baseUrl: 'https://h/api', http, writes });
  return { tools, http };
}

function toolNamed(tools: GeneratedTool[], name: string): GeneratedTool {
  const tool = tools.find(t => t.name === name);
  if (!tool) {
    throw new Error(`tool ${name} not generated (have: ${tools.map(t => t.name).join(', ')})`);
  }
  return tool;
}

describe('McpBuilder', () => {
  it('emits the full tool surface (with all writes on), gated on capabilities', () => {
    const fetchOnly = createSchema('tags', z.object({ label: z.string() }), {
      capabilities: ResourceCapabilities.FetchCollection | ResourceCapabilities.FetchSelf,
    });
    const { tools } = build([author, fetchOnly]);
    const names = tools.map(t => t.name);

    expect(names).to.include.members([
      'blog_authors_list',
      'blog_authors_get',
      'blog_authors_create',
      'blog_authors_update',
      'blog_authors_delete',
      'blog_authors_articles_get', // to-many relationship read
      'blog_authors_articles_set', // to-many replace
      'blog_authors_articles_add', // to-many add
      'blog_authors_articles_remove', // to-many remove
      'blog_authors_editor_get', // to-one relationship read
      'blog_authors_editor_set', // to-one set
      'blog_tags_list',
      'blog_tags_get',
    ]);
    // to-one relationships get no add/remove (JSON:API: to-many only)
    expect(names).to.not.include.members(['blog_authors_editor_add', 'blog_authors_editor_remove']);
    // fetch-only resource exposes no write tools even with writes enabled
    expect(names).to.not.include.members(['blog_tags_create', 'blog_tags_update', 'blog_tags_delete']);
  });

  it('is read-only by default — writes are opt-in', () => {
    const { tools } = build([author], stubClient(), {});
    const names = tools.map(t => t.name);

    expect(names).to.include.members([
      'blog_authors_list',
      'blog_authors_get',
      'blog_authors_articles_get',
      'blog_authors_editor_get',
    ]);
    expect(names.some(n => /_(create|update|delete|set|add|remove)$/.test(n))).to.equal(false);
  });

  it('gates each write independently', () => {
    const { tools } = build([author], stubClient(), { create: true });
    const names = tools.map(t => t.name);
    expect(names).to.include('blog_authors_create');
    expect(names).to.not.include.members([
      'blog_authors_update',
      'blog_authors_delete',
      'blog_authors_articles_set',
    ]);
  });

  it('list builds a JSON:API query from include/fields/sort/filter', async () => {
    const { tools, http } = build([author]);
    await toolNamed(tools, 'blog_authors_list').handler({
      filter: 'name==jo',
      sort: '-createdAt',
      include: ['articles', 'editor'],
      fields: { authors: 'name', articles: 'body' },
    });

    const query = new URL(http.calls[0]!.url).searchParams;
    expect(http.calls[0]!.url.startsWith('https://h/api/authors?')).to.equal(true);
    expect(query.get('filter')).to.equal('name==jo');
    expect(query.get('sort')).to.equal('-createdAt');
    expect(query.get('include')).to.equal('articles,editor');
    expect(query.get('fields[authors]')).to.equal('name');
    expect(query.get('fields[articles]')).to.equal('body');
  });

  it('exposes relationships in the create input schema with correct cardinality', () => {
    const { tools } = build([author]);
    const props = toolNamed(tools, 'blog_authors_create').inputSchema.properties as Record<
      string,
      any
    >;
    const relProps = props.relationships.properties as Record<string, any>;
    expect(relProps.articles.type).to.equal('array'); // to-many
    expect(relProps.editor.type).to.deep.equal(['string', 'null']); // to-one nullable
  });

  it('builds JSON:API relationship linkage in the create body', async () => {
    const { tools, http } = build([author]);
    await toolNamed(tools, 'blog_authors_create').handler({
      attributes: { name: 'Jo' },
      relationships: { articles: ['a1', 'a2'], editor: 'e1' },
    });

    const body = JSON.parse(String(http.calls[0]!.init!.body));
    expect(body.data.type).to.equal('authors');
    expect(body.data.attributes).to.deep.equal({ name: 'Jo' });
    expect(body.data.relationships.articles).to.deep.equal({
      data: [
        { type: 'articles', id: 'a1' },
        { type: 'articles', id: 'a2' },
      ],
    });
    expect(body.data.relationships.editor).to.deep.equal({ data: { type: 'authors', id: 'e1' } });
  });

  it('clears a to-one relationship when passed null', async () => {
    const { tools, http } = build([author]);
    await toolNamed(tools, 'blog_authors_update').handler({
      id: 'x',
      attributes: {},
      relationships: { editor: null },
    });

    const body = JSON.parse(String(http.calls[0]!.init!.body));
    expect(body.data.relationships.editor).to.deep.equal({ data: null });
  });

  it('relationship read hits the JSON:API relationships endpoint', async () => {
    const { tools, http } = build([author]);
    await toolNamed(tools, 'blog_authors_articles_get').handler({ id: 'au1' });
    expect(http.calls[0]!.url).to.equal('https://h/api/authors/au1/relationships/articles');
  });

  it('to-many relationship add POSTs linkage members', async () => {
    const { tools, http } = build([author]);
    await toolNamed(tools, 'blog_authors_articles_add').handler({
      id: 'au1',
      relatedIds: ['a1', 'a2'],
    });
    expect(http.calls[0]!.url).to.equal('https://h/api/authors/au1/relationships/articles');
    expect(http.calls[0]!.init!.method).to.equal('POST');
    expect(JSON.parse(String(http.calls[0]!.init!.body))).to.deep.equal({
      data: [
        { type: 'articles', id: 'a1' },
        { type: 'articles', id: 'a2' },
      ],
    });
  });

  it('to-one relationship set PATCHes nullable linkage', async () => {
    const { tools, http } = build([author]);
    await toolNamed(tools, 'blog_authors_editor_set').handler({ id: 'au1', relatedId: null });
    expect(http.calls[0]!.init!.method).to.equal('PATCH');
    expect(JSON.parse(String(http.calls[0]!.init!.body))).to.deep.equal({ data: null });
  });

  it('delete issues a DELETE to the resource url', async () => {
    const { tools, http } = build([author]);
    await toolNamed(tools, 'blog_authors_delete').handler({ id: 'au1' });
    expect(http.calls[0]!.url).to.equal('https://h/api/authors/au1');
    expect(http.calls[0]!.init!.method).to.equal('DELETE');
  });
});
