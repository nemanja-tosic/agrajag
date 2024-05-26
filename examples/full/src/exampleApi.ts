import { api } from './baseApi.js';
const injectedRtkApi = api.injectEndpoints({
  endpoints: build => ({
    getArticles: build.query<GetArticlesApiResponse, GetArticlesApiArg>({
      query: queryArg => ({
        url: `/articles`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    postArticles: build.mutation<PostArticlesApiResponse, PostArticlesApiArg>({
      query: queryArg => ({
        url: `/articles`,
        method: 'POST',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    getArticlesId: build.query<GetArticlesIdApiResponse, GetArticlesIdApiArg>({
      query: queryArg => ({
        url: `/articles/:id`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    patchArticlesId: build.mutation<
      PatchArticlesIdApiResponse,
      PatchArticlesIdApiArg
    >({
      query: queryArg => ({
        url: `/articles/:id`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    deleteArticlesId: build.mutation<
      DeleteArticlesIdApiResponse,
      DeleteArticlesIdApiArg
    >({
      query: queryArg => ({
        url: `/articles/:id`,
        method: 'DELETE',
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    getArticlesIdRelationshipsAuthor: build.query<
      GetArticlesIdRelationshipsAuthorApiResponse,
      GetArticlesIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/articles/:id/relationships/author`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    postArticlesIdRelationshipsAuthor: build.mutation<
      PostArticlesIdRelationshipsAuthorApiResponse,
      PostArticlesIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/articles/:id/relationships/author`,
        method: 'POST',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    patchArticlesIdRelationshipsAuthor: build.mutation<
      PatchArticlesIdRelationshipsAuthorApiResponse,
      PatchArticlesIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/articles/:id/relationships/author`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    deleteArticlesIdRelationshipsAuthor: build.mutation<
      DeleteArticlesIdRelationshipsAuthorApiResponse,
      DeleteArticlesIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/articles/:id/relationships/author`,
        method: 'DELETE',
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    getArticlesIdRelationshipsComments: build.query<
      GetArticlesIdRelationshipsCommentsApiResponse,
      GetArticlesIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/articles/:id/relationships/comments`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    postArticlesIdRelationshipsComments: build.mutation<
      PostArticlesIdRelationshipsCommentsApiResponse,
      PostArticlesIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/articles/:id/relationships/comments`,
        method: 'POST',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    patchArticlesIdRelationshipsComments: build.mutation<
      PatchArticlesIdRelationshipsCommentsApiResponse,
      PatchArticlesIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/articles/:id/relationships/comments`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    deleteArticlesIdRelationshipsComments: build.mutation<
      DeleteArticlesIdRelationshipsCommentsApiResponse,
      DeleteArticlesIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/articles/:id/relationships/comments`,
        method: 'DELETE',
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    getAuthors: build.query<GetAuthorsApiResponse, GetAuthorsApiArg>({
      query: queryArg => ({
        url: `/authors`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    postAuthors: build.mutation<PostAuthorsApiResponse, PostAuthorsApiArg>({
      query: queryArg => ({
        url: `/authors`,
        method: 'POST',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    getAuthorsId: build.query<GetAuthorsIdApiResponse, GetAuthorsIdApiArg>({
      query: queryArg => ({
        url: `/authors/:id`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    patchAuthorsId: build.mutation<
      PatchAuthorsIdApiResponse,
      PatchAuthorsIdApiArg
    >({
      query: queryArg => ({
        url: `/authors/:id`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    deleteAuthorsId: build.mutation<
      DeleteAuthorsIdApiResponse,
      DeleteAuthorsIdApiArg
    >({
      query: queryArg => ({
        url: `/authors/:id`,
        method: 'DELETE',
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    getComments: build.query<GetCommentsApiResponse, GetCommentsApiArg>({
      query: queryArg => ({
        url: `/comments`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    postComments: build.mutation<PostCommentsApiResponse, PostCommentsApiArg>({
      query: queryArg => ({
        url: `/comments`,
        method: 'POST',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    getCommentsId: build.query<GetCommentsIdApiResponse, GetCommentsIdApiArg>({
      query: queryArg => ({
        url: `/comments/:id`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    patchCommentsId: build.mutation<
      PatchCommentsIdApiResponse,
      PatchCommentsIdApiArg
    >({
      query: queryArg => ({
        url: `/comments/:id`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    deleteCommentsId: build.mutation<
      DeleteCommentsIdApiResponse,
      DeleteCommentsIdApiArg
    >({
      query: queryArg => ({
        url: `/comments/:id`,
        method: 'DELETE',
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    getCommentsIdRelationshipsAuthor: build.query<
      GetCommentsIdRelationshipsAuthorApiResponse,
      GetCommentsIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/comments/:id/relationships/author`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    postCommentsIdRelationshipsAuthor: build.mutation<
      PostCommentsIdRelationshipsAuthorApiResponse,
      PostCommentsIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/comments/:id/relationships/author`,
        method: 'POST',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    patchCommentsIdRelationshipsAuthor: build.mutation<
      PatchCommentsIdRelationshipsAuthorApiResponse,
      PatchCommentsIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/comments/:id/relationships/author`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
    deleteCommentsIdRelationshipsAuthor: build.mutation<
      DeleteCommentsIdRelationshipsAuthorApiResponse,
      DeleteCommentsIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/comments/:id/relationships/author`,
        method: 'DELETE',
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as exampleApi };
export type GetArticlesApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'articles';
  attributes: {
    title: string;
    body: string;
    tags: string[];
  };
  relationships: {
    author: {
      data: {
        id: string;
        type: 'authors';
      };
    };
    comments: {
      data: {
        id: string;
        type: 'comments';
      }[];
    };
  };
};
export type GetArticlesApiArg = {
  include?: string;
  fields?: string;
  sort?: string;
};
export type PostArticlesApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'articles';
  attributes: {
    title: string;
    body: string;
    tags: string[];
  };
  relationships: {
    author: {
      data: {
        id: string;
        type: 'authors';
      };
    };
    comments: {
      data: {
        id: string;
        type: 'comments';
      }[];
    };
  };
};
export type PostArticlesApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: {
    id: string;
    type: 'articles';
    attributes: {
      title: string;
      body: string;
      tags: string[];
    };
    relationships: {
      author: {
        data: {
          id: string;
          type: 'authors';
        };
      };
      comments: {
        data: {
          id: string;
          type: 'comments';
        }[];
      };
    };
  };
};
export type GetArticlesIdApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'articles';
  attributes: {
    title: string;
    body: string;
    tags: string[];
  };
  relationships: {
    author: {
      data: {
        id: string;
        type: 'authors';
      };
    };
    comments: {
      data: {
        id: string;
        type: 'comments';
      }[];
    };
  };
};
export type GetArticlesIdApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
export type PatchArticlesIdApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'articles';
  attributes: {
    title: string;
    body: string;
    tags: string[];
  };
  relationships: {
    author: {
      data: {
        id: string;
        type: 'authors';
      };
    };
    comments: {
      data: {
        id: string;
        type: 'comments';
      }[];
    };
  };
};
export type PatchArticlesIdApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: any;
};
export type DeleteArticlesIdApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'articles';
  attributes: {
    title: string;
    body: string;
    tags: string[];
  };
  relationships: {
    author: {
      data: {
        id: string;
        type: 'authors';
      };
    };
    comments: {
      data: {
        id: string;
        type: 'comments';
      }[];
    };
  };
};
export type DeleteArticlesIdApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
export type GetArticlesIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: object;
  };
export type GetArticlesIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
export type PostArticlesIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: object;
  };
export type PostArticlesIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: object;
  };
};
export type PatchArticlesIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: object;
  };
export type PatchArticlesIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: any;
};
export type DeleteArticlesIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: object;
  };
export type DeleteArticlesIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
export type GetArticlesIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'comments';
    attributes: {
      body: string;
    };
    relationships: {
      author: {
        data: {
          id: string;
          type: 'authors';
        };
      };
    };
  };
export type GetArticlesIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
export type PostArticlesIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'comments';
    attributes: {
      body: string;
    };
    relationships: {
      author: {
        data: {
          id: string;
          type: 'authors';
        };
      };
    };
  };
export type PostArticlesIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: {
    id: string;
    type: 'comments';
    attributes: {
      body: string;
    };
    relationships: {
      author: {
        data: {
          id: string;
          type: 'authors';
        };
      };
    };
  };
};
export type PatchArticlesIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'comments';
    attributes: {
      body: string;
    };
    relationships: {
      author: {
        data: {
          id: string;
          type: 'authors';
        };
      };
    };
  };
export type PatchArticlesIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: any;
};
export type DeleteArticlesIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'comments';
    attributes: {
      body: string;
    };
    relationships: {
      author: {
        data: {
          id: string;
          type: 'authors';
        };
      };
    };
  };
export type DeleteArticlesIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
export type GetAuthorsApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'authors';
  attributes: {
    name: string;
    category: string;
  };
  relationships: object;
};
export type GetAuthorsApiArg = {
  include?: string;
  fields?: string;
  sort?: string;
};
export type PostAuthorsApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'authors';
  attributes: {
    name: string;
    category: string;
  };
  relationships: object;
};
export type PostAuthorsApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: object;
  };
};
export type GetAuthorsIdApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'authors';
  attributes: {
    name: string;
    category: string;
  };
  relationships: object;
};
export type GetAuthorsIdApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
export type PatchAuthorsIdApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'authors';
  attributes: {
    name: string;
    category: string;
  };
  relationships: object;
};
export type PatchAuthorsIdApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: any;
};
export type DeleteAuthorsIdApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'authors';
  attributes: {
    name: string;
    category: string;
  };
  relationships: object;
};
export type DeleteAuthorsIdApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
export type GetCommentsApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'comments';
  attributes: {
    body: string;
  };
  relationships: {
    author: {
      data: {
        id: string;
        type: 'authors';
      };
    };
  };
};
export type GetCommentsApiArg = {
  include?: string;
  fields?: string;
  sort?: string;
};
export type PostCommentsApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'comments';
  attributes: {
    body: string;
  };
  relationships: {
    author: {
      data: {
        id: string;
        type: 'authors';
      };
    };
  };
};
export type PostCommentsApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: {
    id: string;
    type: 'comments';
    attributes: {
      body: string;
    };
    relationships: {
      author: {
        data: {
          id: string;
          type: 'authors';
        };
      };
    };
  };
};
export type GetCommentsIdApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'comments';
  attributes: {
    body: string;
  };
  relationships: {
    author: {
      data: {
        id: string;
        type: 'authors';
      };
    };
  };
};
export type GetCommentsIdApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
export type PatchCommentsIdApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'comments';
  attributes: {
    body: string;
  };
  relationships: {
    author: {
      data: {
        id: string;
        type: 'authors';
      };
    };
  };
};
export type PatchCommentsIdApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: any;
};
export type DeleteCommentsIdApiResponse = /** status 200 undefined */ {
  id: string;
  type: 'comments';
  attributes: {
    body: string;
  };
  relationships: {
    author: {
      data: {
        id: string;
        type: 'authors';
      };
    };
  };
};
export type DeleteCommentsIdApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
export type GetCommentsIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: object;
  };
export type GetCommentsIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
export type PostCommentsIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: object;
  };
export type PostCommentsIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: object;
  };
};
export type PatchCommentsIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: object;
  };
export type PatchCommentsIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
  body: any;
};
export type DeleteCommentsIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: object;
  };
export type DeleteCommentsIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: string;
  sort?: string;
};
