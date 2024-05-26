import { exampleApi } from './exampleApi.js';

const articleCollection = exampleApi.useGetArticlesQuery({});

const specificArticle = exampleApi.useGetArticlesIdQuery({ id: '' });
