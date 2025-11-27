import { inferredApi } from './inferredApi.js';

const articleCollection = inferredApi.useGetArticlesQuery({});

const specificArticle = inferredApi.useGetArticlesByIdQuery({ id: '' });
