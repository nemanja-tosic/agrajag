@fetching
Feature: Sparse fieldsets
  A client MAY request that an endpoint return only specific fields in the response on
  a per-type basis by including a fields[TYPE] query parameter.

  The value of any fields[TYPE] parameter MUST be a comma-separated (U+002C COMMA, “,”) list that
  refers to the name(s) of the fields to be returned. An empty value indicates that no fields should be returned.

  If a client requests a restricted set of fields for a given resource type, an endpoint MUST NOT include additional
  fields in resource objects of that type in its response.

  If a client does not specify the set of fields for a given resource type, the server MAY send all fields,
  a subset of fields, or no fields for that resource type.

  ```
  GET /articles?include=author&fields[articles]=title,body&fields[authors]=name HTTP/1.1
  Accept: application/vnd.api+json
  ```

  Background:
    Given the test data

  Scenario: Sparse fieldsets
    When I send a "GET" request to "/articles?include=author&fields[articles]=title,body&fields[authors]=name"
    Then the response status should be 200
    And the response body should be:
      """
      {
  "data": [
    {
      "type": "articles",
      "id": "articles-1",
      "attributes": {
        "title": "Foo",
        "body": "Bar"
      },
      "relationships": {
        "author": {
          "data": { "type": "authors", "id": "authors-1" }
        },
        "comments": {
          "data": [
            { "type": "comments", "id": "comments-1" },
            { "type": "comments", "id": "comments-2" }
          ]
        }
      }
    },
    {
      "type": "articles",
      "id": "articles-2",
      "attributes": {
        "title": "Foo",
        "body": "Bar"
      },
      "relationships": {
        "author": {
          "data": { "type": "authors", "id": "authors-1" }
        },
        "comments": {
          "data": [
            { "type": "comments", "id": "comments-3" }
          ]
        }
      }
    },
    {
      "type": "articles",
      "id": "articles-3",
      "attributes": {
        "title": "Foo",
        "body": "Bar"
      },
      "relationships": {
        "author": {
          "data": { "type": "authors", "id": "authors-1" }
        },
        "comments": {
          "data": []
        }
      }
    }
  ],
    "included": [
      {
        "type": "authors",
        "id": "authors-1",
        "attributes": {
          "name": "Nemanja"
        }
      }
    ]
  }
       """
