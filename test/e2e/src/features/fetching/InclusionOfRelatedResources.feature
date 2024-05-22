@fetching
Feature: Fetching relationships
  An endpoint MAY return resources related to the primary data by default.

  An endpoint MAY also support an include query parameter to allow the client to customize
  which related resources should be returned.

  If an endpoint does not support the include parameter, it MUST respond with 400 Bad Request
  to any requests that include it.

  If an endpoint supports the include parameter and a client supplies it:

  * The server’s response MUST be a compound document with an included key — even if that included
  key holds an empty array (because the requested relationships are empty).
  * The server MUST NOT include unrequested resource objects in the included section of the compound document.

  The value of the include parameter MUST be a comma-separated (U+002C COMMA, “,”) list of relationship paths.
  A relationship path is a dot-separated (U+002E FULL-STOP, “.”) list of relationship names.
  An empty value indicates that no related resources should be returned.

  If a server is unable to identify a relationship path or does not support inclusion of resources
  from a path, it MUST respond with 400 Bad Request.

  See: https://jsonapi.org/format/#fetching-relationships

  Background:
    Given the test data

  Scenario: Fetching resources with included relationships
    When I send a "GET" request to "/articles/articles-1?include=author,comments"
    Then the response status should be 200
    And the response body should be:
      """
      {
        "data": {
          "type": "articles",
          "id": "articles-1",
          "attributes": {
            "title": "Foo",
            "body": "Bar",
            "tags": ["Baz"]
          },
          "relationships": {
            "author": {
              "data": {
                "type": "authors",
                "id": "authors-1"
              }
            },
            "comments": {
              "data": [
                {
                  "type": "comments",
                  "id": "comments-1"
                },
                {
                  "type": "comments",
                  "id": "comments-2"
                }
              ]
            }
          }
        },
        "included": [
          {
            "type": "authors",
            "id": "authors-1",
            "attributes": {
              "name": "Nemanja",
              "category": "IT"
            }
          },
          {
            "id": "comments-1",
            "type": "comments",
            "attributes": {
              "body": "Foo"
            }
          },
          {
            "id": "comments-2",
            "type": "comments",
            "attributes": {
              "body": "Bar"
            }
          }
        ]
      }
      """

  Scenario: Fetching collection of resources with included relationships
    When I send a "GET" request to "/articles?include=author,comments"
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
        "body": "Bar",
        "tags": ["Baz"]
      },
      "relationships": {
        "author": {
          "data": {
            "type": "authors",
            "id": "authors-1"
          }
        },
        "comments": {
          "data": [
            {
              "id": "comments-1",
              "type": "comments"
            },
            {
              "id": "comments-2",
              "type": "comments"
            }
          ]
        }
      }
    },
    {
      "type": "articles",
      "id": "articles-2",
      "attributes": {
        "title": "Foo",
        "body": "Bar",
        "tags": ["Baz"]
      },
      "relationships": {
        "author": {
          "data": {
            "type": "authors",
            "id": "authors-1"
          }
        },
        "comments": {
          "data": [
            {
              "id": "comments-3",
              "type": "comments"
            }
          ]
        }
      }
    },
    {
      "type": "articles",
      "id": "articles-3",
      "attributes": {
        "title": "Foo1",
        "body": "Bar",
        "tags": ["Baz"]
      },
      "relationships": {
        "author": {
          "data": null
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
        "name": "Nemanja",
        "category": "IT"
      }
    },
    {
      "id": "comments-1",
      "type": "comments",
      "attributes": {
        "body": "Foo"
      }
    },
    {
      "id": "comments-2",
      "type": "comments",
      "attributes": {
        "body": "Bar"
      }
    },
    {
      "id": "comments-3",
      "type": "comments",
      "attributes": {
        "body": "Baz"
      }
    }
  ]
}
      """
