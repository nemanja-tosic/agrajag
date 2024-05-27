Feature: Pagination

  Background:
    Given the test data

#  Scenario: Fetching paginated resources
#    When I send a "GET" request to "/articles?page[number]=1&page[size]=2"
#    Then the response status should be 200
#    And the response body should be:
#      """
#      {
#        "data": [
#          {
#            "type": "articles",
#            "id": "articles-1",
#            "attributes": {
#              "title": "Foo",
#              "body": "Bar",
#              "tags": ["Baz"]
#            },
#            "relationships": {
#              "author": {
#                "data": {
#                  "type": "authors",
#                  "id": "authors-1"
#                }
#              },
#              "comments": {
#                "data": [
#                  {
#                    "type": "comments",
#                    "id": "comments-1"
#                  },
#                  {
#                    "type": "comments",
#                    "id": "comments-2"
#                  }
#                ]
#              }
#            }
#          },
#          {
#            "type": "articles",
#            "id": "articles-2",
#            "attributes": {
#              "title": "Foo",
#              "body": "Bar",
#              "tags": ["Baz"]
#            },
#            "relationships": {
#              "author": {
#                "data": {
#                  "type": "authors",
#                  "id": "authors-1"
#                }
#              },
#              "comments": {
#                "data": [
#                  {
#                    "type": "comments",
#                    "id": "comments-3"
#                  }
#                ]
#              }
#            }
#          }
#        ],
#        "links": {
#          "first": "/articles?page[number]=1&page[size]=2",
#          "last": "/articles?page[number]=2&page[size]=2",
#          "prev": null,
#          "next": "/articles?page[number]=2&page[size]=2"
#        }
#      }
#      """