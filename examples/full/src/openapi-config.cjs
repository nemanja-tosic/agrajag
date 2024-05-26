/**
 * @type {import('@rtk-query/codegen-openapi').ConfigFile}
 */
const config = {
  schemaFile: 'http://127.0.0.1:8888/openapi.json',
  apiFile: './baseApi.ts',
  apiImport: 'api',
  outputFile: './exampleApi.ts',
  exportName: 'exampleApi',
}

module.exports = config;
