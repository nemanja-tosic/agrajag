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
          filter: queryArg.filter,
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
          filter: queryArg.filter,
        },
      }),
    }),
    getArticlesById: build.query<
      GetArticlesByIdApiResponse,
      GetArticlesByIdApiArg
    >({
      query: queryArg => ({
        url: `/articles/${queryArg.id}`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    patchArticlesById: build.mutation<
      PatchArticlesByIdApiResponse,
      PatchArticlesByIdApiArg
    >({
      query: queryArg => ({
        url: `/articles/${queryArg.id}`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    deleteArticlesById: build.mutation<
      DeleteArticlesByIdApiResponse,
      DeleteArticlesByIdApiArg
    >({
      query: queryArg => ({
        url: `/articles/${queryArg.id}`,
        method: 'DELETE',
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    getArticlesByIdRelationshipsAuthor: build.query<
      GetArticlesByIdRelationshipsAuthorApiResponse,
      GetArticlesByIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/articles/${queryArg.id}/relationships/author`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    postArticlesByIdRelationshipsAuthor: build.mutation<
      PostArticlesByIdRelationshipsAuthorApiResponse,
      PostArticlesByIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/articles/${queryArg.id}/relationships/author`,
        method: 'POST',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    patchArticlesByIdRelationshipsAuthor: build.mutation<
      PatchArticlesByIdRelationshipsAuthorApiResponse,
      PatchArticlesByIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/articles/${queryArg.id}/relationships/author`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    deleteArticlesByIdRelationshipsAuthor: build.mutation<
      DeleteArticlesByIdRelationshipsAuthorApiResponse,
      DeleteArticlesByIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/articles/${queryArg.id}/relationships/author`,
        method: 'DELETE',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    getArticlesByIdRelationshipsComments: build.query<
      GetArticlesByIdRelationshipsCommentsApiResponse,
      GetArticlesByIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/articles/${queryArg.id}/relationships/comments`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    postArticlesByIdRelationshipsComments: build.mutation<
      PostArticlesByIdRelationshipsCommentsApiResponse,
      PostArticlesByIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/articles/${queryArg.id}/relationships/comments`,
        method: 'POST',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    patchArticlesByIdRelationshipsComments: build.mutation<
      PatchArticlesByIdRelationshipsCommentsApiResponse,
      PatchArticlesByIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/articles/${queryArg.id}/relationships/comments`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    deleteArticlesByIdRelationshipsComments: build.mutation<
      DeleteArticlesByIdRelationshipsCommentsApiResponse,
      DeleteArticlesByIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/articles/${queryArg.id}/relationships/comments`,
        method: 'DELETE',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
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
          filter: queryArg.filter,
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
          filter: queryArg.filter,
        },
      }),
    }),
    getAuthorsById: build.query<
      GetAuthorsByIdApiResponse,
      GetAuthorsByIdApiArg
    >({
      query: queryArg => ({
        url: `/authors/${queryArg.id}`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    patchAuthorsById: build.mutation<
      PatchAuthorsByIdApiResponse,
      PatchAuthorsByIdApiArg
    >({
      query: queryArg => ({
        url: `/authors/${queryArg.id}`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    deleteAuthorsById: build.mutation<
      DeleteAuthorsByIdApiResponse,
      DeleteAuthorsByIdApiArg
    >({
      query: queryArg => ({
        url: `/authors/${queryArg.id}`,
        method: 'DELETE',
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    getAuthorsByIdRelationshipsComments: build.query<
      GetAuthorsByIdRelationshipsCommentsApiResponse,
      GetAuthorsByIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/authors/${queryArg.id}/relationships/comments`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    postAuthorsByIdRelationshipsComments: build.mutation<
      PostAuthorsByIdRelationshipsCommentsApiResponse,
      PostAuthorsByIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/authors/${queryArg.id}/relationships/comments`,
        method: 'POST',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    patchAuthorsByIdRelationshipsComments: build.mutation<
      PatchAuthorsByIdRelationshipsCommentsApiResponse,
      PatchAuthorsByIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/authors/${queryArg.id}/relationships/comments`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    deleteAuthorsByIdRelationshipsComments: build.mutation<
      DeleteAuthorsByIdRelationshipsCommentsApiResponse,
      DeleteAuthorsByIdRelationshipsCommentsApiArg
    >({
      query: queryArg => ({
        url: `/authors/${queryArg.id}/relationships/comments`,
        method: 'DELETE',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
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
          filter: queryArg.filter,
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
          filter: queryArg.filter,
        },
      }),
    }),
    getCommentsById: build.query<
      GetCommentsByIdApiResponse,
      GetCommentsByIdApiArg
    >({
      query: queryArg => ({
        url: `/comments/${queryArg.id}`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    patchCommentsById: build.mutation<
      PatchCommentsByIdApiResponse,
      PatchCommentsByIdApiArg
    >({
      query: queryArg => ({
        url: `/comments/${queryArg.id}`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    deleteCommentsById: build.mutation<
      DeleteCommentsByIdApiResponse,
      DeleteCommentsByIdApiArg
    >({
      query: queryArg => ({
        url: `/comments/${queryArg.id}`,
        method: 'DELETE',
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    getCommentsByIdRelationshipsAuthor: build.query<
      GetCommentsByIdRelationshipsAuthorApiResponse,
      GetCommentsByIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/comments/${queryArg.id}/relationships/author`,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    postCommentsByIdRelationshipsAuthor: build.mutation<
      PostCommentsByIdRelationshipsAuthorApiResponse,
      PostCommentsByIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/comments/${queryArg.id}/relationships/author`,
        method: 'POST',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    patchCommentsByIdRelationshipsAuthor: build.mutation<
      PatchCommentsByIdRelationshipsAuthorApiResponse,
      PatchCommentsByIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/comments/${queryArg.id}/relationships/author`,
        method: 'PATCH',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
    deleteCommentsByIdRelationshipsAuthor: build.mutation<
      DeleteCommentsByIdRelationshipsAuthorApiResponse,
      DeleteCommentsByIdRelationshipsAuthorApiArg
    >({
      query: queryArg => ({
        url: `/comments/${queryArg.id}/relationships/author`,
        method: 'DELETE',
        body: queryArg.body,
        params: {
          include: queryArg.include,
          fields: queryArg.fields,
          sort: queryArg.sort,
          filter: queryArg.filter,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as exampleApi };
export type GetArticlesApiResponse = /** status 200 undefined */ {
  data: {
    id?: string;
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
  }[];
  'x-denormalized'?: Articles[];
};
export type GetArticlesApiArg = {
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
};
export type PostArticlesApiResponse = /** status 200 undefined */ {
  data: {
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
  'x-denormalized'?: Articles;
};
export type PostArticlesApiArg = {
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id?: string;
      type: 'articles';
      attributes: {
        title?: string;
        body?: string;
        tags?: string[];
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
};
export type GetArticlesByIdApiResponse = /** status 200 undefined */ {
  data: {
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
  'x-denormalized'?: Articles;
};
export type GetArticlesByIdApiArg = {
  id: string;
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
};
export type PatchArticlesByIdApiResponse = /** status 200 undefined */ {
  data: {
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
  'x-denormalized'?: Articles;
};
export type PatchArticlesByIdApiArg = {
  id: string;
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'articles';
      attributes: {
        title?: string;
        body?: string;
        tags?: string[];
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
};
export type DeleteArticlesByIdApiResponse = /** status 200 undefined */ {
  data: {
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
  'x-denormalized'?: Articles;
};
export type DeleteArticlesByIdApiArg = {
  id: string;
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
};
export type GetArticlesByIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ Blob;
export type GetArticlesByIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
};
export type PostArticlesByIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    data: {
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
    'x-denormalized'?: Articles;
  };
export type PostArticlesByIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'authors';
      attributes: {
        name: string;
        category: string;
      };
      relationships: {
        comments: {
          data: {
            id: string;
            type: 'comments';
          }[];
        };
      };
    };
  };
};
export type PatchArticlesByIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    data: {
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
    'x-denormalized'?: Articles;
  };
export type PatchArticlesByIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'authors';
      attributes: {
        name: string;
        category: string;
      };
      relationships: {
        comments: {
          data: {
            id: string;
            type: 'comments';
          }[];
        };
      };
    };
  };
};
export type DeleteArticlesByIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    data: {
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
    'x-denormalized'?: Articles;
  };
export type DeleteArticlesByIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'authors';
      attributes: {
        name: string;
        category: string;
      };
      relationships: {
        comments: {
          data: {
            id: string;
            type: 'comments';
          }[];
        };
      };
    };
  };
};
export type GetArticlesByIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ Blob;
export type GetArticlesByIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
};
export type PostArticlesByIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ {
    data: {
      id?: string;
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
    }[];
    'x-denormalized'?: Articles[];
  };
export type PostArticlesByIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'comments';
    }[];
  };
};
export type PatchArticlesByIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ {
    data: {
      id?: string;
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
    }[];
    'x-denormalized'?: Articles[];
  };
export type PatchArticlesByIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'comments';
    }[];
  };
};
export type DeleteArticlesByIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ {
    data: {
      id?: string;
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
    }[];
    'x-denormalized'?: Articles[];
  };
export type DeleteArticlesByIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: {
    articles?: string;
    author?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'comments';
    }[];
  };
};
export type GetAuthorsApiResponse = /** status 200 undefined */ {
  data: {
    id?: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: {
      comments: {
        data: {
          id: string;
          type: 'comments';
        }[];
      };
    };
  }[];
  'x-denormalized'?: Authors[];
};
export type GetAuthorsApiArg = {
  include?: string;
  fields?: {
    authors?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
};
export type PostAuthorsApiResponse = /** status 200 undefined */ {
  data: {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: {
      comments: {
        data: {
          id: string;
          type: 'comments';
        }[];
      };
    };
  };
  'x-denormalized'?: Authors;
};
export type PostAuthorsApiArg = {
  include?: string;
  fields?: {
    authors?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id?: string;
      type: 'authors';
      attributes: {
        name?: string;
        category?: string;
      };
      relationships: {
        comments: {
          data: {
            id: string;
            type: 'comments';
          }[];
        };
      };
    };
  };
};
export type GetAuthorsByIdApiResponse = /** status 200 undefined */ {
  data: {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: {
      comments: {
        data: {
          id: string;
          type: 'comments';
        }[];
      };
    };
  };
  'x-denormalized'?: Authors;
};
export type GetAuthorsByIdApiArg = {
  id: string;
  include?: string;
  fields?: {
    authors?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
};
export type PatchAuthorsByIdApiResponse = /** status 200 undefined */ {
  data: {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: {
      comments: {
        data: {
          id: string;
          type: 'comments';
        }[];
      };
    };
  };
  'x-denormalized'?: Authors;
};
export type PatchAuthorsByIdApiArg = {
  id: string;
  include?: string;
  fields?: {
    authors?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'authors';
      attributes: {
        name?: string;
        category?: string;
      };
      relationships: {
        comments: {
          data: {
            id: string;
            type: 'comments';
          }[];
        };
      };
    };
  };
};
export type DeleteAuthorsByIdApiResponse = /** status 200 undefined */ {
  data: {
    id: string;
    type: 'authors';
    attributes: {
      name: string;
      category: string;
    };
    relationships: {
      comments: {
        data: {
          id: string;
          type: 'comments';
        }[];
      };
    };
  };
  'x-denormalized'?: Authors;
};
export type DeleteAuthorsByIdApiArg = {
  id: string;
  include?: string;
  fields?: {
    authors?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
};
export type GetAuthorsByIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ Blob;
export type GetAuthorsByIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: {
    authors?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
};
export type PostAuthorsByIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ {
    data: {
      id?: string;
      type: 'authors';
      attributes: {
        name: string;
        category: string;
      };
      relationships: {
        comments: {
          data: {
            id: string;
            type: 'comments';
          }[];
        };
      };
    }[];
    'x-denormalized'?: Authors[];
  };
export type PostAuthorsByIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: {
    authors?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'comments';
    }[];
  };
};
export type PatchAuthorsByIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ {
    data: {
      id?: string;
      type: 'authors';
      attributes: {
        name: string;
        category: string;
      };
      relationships: {
        comments: {
          data: {
            id: string;
            type: 'comments';
          }[];
        };
      };
    }[];
    'x-denormalized'?: Authors[];
  };
export type PatchAuthorsByIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: {
    authors?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'comments';
    }[];
  };
};
export type DeleteAuthorsByIdRelationshipsCommentsApiResponse =
  /** status 200 undefined */ {
    data: {
      id?: string;
      type: 'authors';
      attributes: {
        name: string;
        category: string;
      };
      relationships: {
        comments: {
          data: {
            id: string;
            type: 'comments';
          }[];
        };
      };
    }[];
    'x-denormalized'?: Authors[];
  };
export type DeleteAuthorsByIdRelationshipsCommentsApiArg = {
  id: string;
  include?: string;
  fields?: {
    authors?: string;
    comments?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'comments';
    }[];
  };
};
export type GetCommentsApiResponse = /** status 200 undefined */ {
  data: {
    id?: string;
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
  }[];
  'x-denormalized'?: Comments[];
};
export type GetCommentsApiArg = {
  include?: string;
  fields?: {
    comments?: string;
    author?: string;
  };
  sort?: string;
  filter?: string;
};
export type PostCommentsApiResponse = /** status 200 undefined */ {
  data: {
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
  'x-denormalized'?: Comments;
};
export type PostCommentsApiArg = {
  include?: string;
  fields?: {
    comments?: string;
    author?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id?: string;
      type: 'comments';
      attributes: {
        body?: string;
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
};
export type GetCommentsByIdApiResponse = /** status 200 undefined */ {
  data: {
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
  'x-denormalized'?: Comments;
};
export type GetCommentsByIdApiArg = {
  id: string;
  include?: string;
  fields?: {
    comments?: string;
    author?: string;
  };
  sort?: string;
  filter?: string;
};
export type PatchCommentsByIdApiResponse = /** status 200 undefined */ {
  data: {
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
  'x-denormalized'?: Comments;
};
export type PatchCommentsByIdApiArg = {
  id: string;
  include?: string;
  fields?: {
    comments?: string;
    author?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'comments';
      attributes: {
        body?: string;
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
};
export type DeleteCommentsByIdApiResponse = /** status 200 undefined */ {
  data: {
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
  'x-denormalized'?: Comments;
};
export type DeleteCommentsByIdApiArg = {
  id: string;
  include?: string;
  fields?: {
    comments?: string;
    author?: string;
  };
  sort?: string;
  filter?: string;
};
export type GetCommentsByIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ Blob;
export type GetCommentsByIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: {
    comments?: string;
    author?: string;
  };
  sort?: string;
  filter?: string;
};
export type PostCommentsByIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    data: {
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
    'x-denormalized'?: Comments;
  };
export type PostCommentsByIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: {
    comments?: string;
    author?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'authors';
      attributes: {
        name: string;
        category: string;
      };
      relationships: {
        comments: {
          data: {
            id: string;
            type: 'comments';
          }[];
        };
      };
    };
  };
};
export type PatchCommentsByIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    data: {
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
    'x-denormalized'?: Comments;
  };
export type PatchCommentsByIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: {
    comments?: string;
    author?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'authors';
      attributes: {
        name: string;
        category: string;
      };
      relationships: {
        comments: {
          data: {
            id: string;
            type: 'comments';
          }[];
        };
      };
    };
  };
};
export type DeleteCommentsByIdRelationshipsAuthorApiResponse =
  /** status 200 undefined */ {
    data: {
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
    'x-denormalized'?: Comments;
  };
export type DeleteCommentsByIdRelationshipsAuthorApiArg = {
  id: string;
  include?: string;
  fields?: {
    comments?: string;
    author?: string;
  };
  sort?: string;
  filter?: string;
  body: {
    data: {
      id: string;
      type: 'authors';
      attributes: {
        name: string;
        category: string;
      };
      relationships: {
        comments: {
          data: {
            id: string;
            type: 'comments';
          }[];
        };
      };
    };
  };
};
export type Comments = {
  id: string;
  body: string;
  author: Authors;
};
export type Authors = {
  id: string;
  name: string;
  category: string;
  comments: Comments[];
};
export type Articles = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  author: Authors;
  comments: Comments[];
};
