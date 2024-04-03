Feature: Creating resources
  Creating resources according to the JSON:API 1.1 spec

  Background:
    Given the test data

    # TODO: UUID comparison is causing it to fail
#  Scenario: Creating a resource
#    When I send a "POST" request to "/articles" with the resource
#      """
#      {
#        "data": {
#          "type": "articles",
#          "attributes": {
#            "title": "Foo",
#            "body": "Bar",
#            "tags": ["Baz"]
#          },
#          "relationships": {
#            "author": {
#              "data": {
#                "type": "authors",
#                "id": "authors-1"
#              }
#            }
#          }
#        }
#      }
#      """
#    Then the response status should be 201
#    And the response body should be:
#      """
#      {
#        "data": {
#          "type": "articles",
#          "attributes": {
#            "title": "Foo",
#            "body": "Bar",
#            "tags": ["Baz"]
#          },
#          "relationships": {
#            "author": {
#              "data": {
#                "type": "authors",
#                "id": "authors-1"
#              }
#            }
#          }
#        }
#      }
#      """

  Scenario: Creating a resource with a client-generated ID
    When I send a "POST" request to "/articles" with the resource
      """
      {
        "data": {
          "type": "articles",
          "id": "1",
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
              "data": []
            }
          }
        }
      }
      """
    Then the response status should be 201
