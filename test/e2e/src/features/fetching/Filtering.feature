Feature: Filtering

  Background:
    Given the test data

  Scenario: Filtering data
    When I send a "GET" request to "articles?filter[title]=Foo"
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
              }
            }
          }
        ]
        }
      """
