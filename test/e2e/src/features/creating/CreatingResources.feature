Feature: Creating resources
  Creating resources according to the JSON:API 1.1 spec

  Background:
    Given the test data

  Scenario: Creating a resource
    When I send a "POST" request to "/articles" with the resource
      """
      {
        "data": {
          "id": "",
          "type": "articles",
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
      }
      """
    Then the response status should be 201
    And the response should contain a valid id

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

  Scenario: Creating a resource with non-existing related resource
    When I send a "POST" request to "/test" with the resource
      """
       {
        "data": {
          "type": "test",
          "attributes": {
            "example": "data"
          }
        }
      }
      """
    Then the response status should be 404

