Feature: Update a resources relationships
  Any or all of a resource’s relationships MAY be included in the resource object
  included in a PATCH request.

  If a request does not include all of the relationships for a resource,
  the server MUST interpret the missing relationships as if they were included
  with their current values. It MUST NOT interpret them as null or empty values.

  If a relationship is provided in the relationships member of a resource object in
  a PATCH request, its value MUST be a relationship object with a data member.
  The relationship’s value will be replaced with the value specified in this member.

  Responses

  If a server accepts an update but also changes the targeted resource in ways
  other than those specified by the request (for example, updating the updatedAt attribute
  or a computed sha), it MUST return a 200 OK response and a document that contains the
  updated resource as primary data.

  A server MAY return a 200 OK response with a document that contains no primary data if
  an update is successful and the server does not change the targeted resource
  in ways other than those specified by the request. Other top-level members,
  such as meta, could be included in the response document.

  Background:
    Given the test data

  Scenario: Updating an existing to-one relationship
    When I send a "PATCH" request to "/articles/articles-1" with the resource
      """
      {
        "data": {
          "type": "articles",
          "id": "articles-1",
          "relationships": {
            "author": {
              "data": { "type": "authors", "id": "authors-2" }
            }
          }
        }
      }
      """
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
              "data": { "type": "authors", "id": "authors-2" }
            },
            "comments": {
              "data": [
                { "type": "comments", "id": "comments-1" },
                { "type": "comments", "id": "comments-2" }
              ]
            }
          }
        }
      }
      """

  Scenario: Updating an existing to-one relationship with null
    When I send a "PATCH" request to "/articles/articles-1" with the resource
      """
      {
        "data": {
          "type": "articles",
          "id": "articles-1",
          "relationships": {
            "author": {
              "data": null
            }
          }
        }
      }
      """
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
            "data": null
          },
          "comments": {
            "data": [
              { "type": "comments", "id": "comments-1" },
              { "type": "comments", "id": "comments-2" }
            ]
          }
        }
      }
    }
    """

  Scenario: Updating a to-many relationship
    When I send a "PATCH" request to "/articles/articles-1" with the resource
      """
      {
        "data": {
          "type": "articles",
          "id": "articles-1",
          "relationships": {
            "comments": {
              "data": [
                { "type": "comments", "id": "comments-3" }
              ]
            }
          }
        }
      }
      """
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
            "data": { "type": "authors", "id": "authors-1" }
          },
          "comments": {
            "data": [
              { "type": "comments", "id": "comments-3" }
            ]
          }
        }
      }
    }
    """

  Scenario: Clearing a to-many relationship
    When I send a "PATCH" request to "/articles/articles-1" with the resource
      """
      {
        "data": {
          "type": "articles",
          "id": "articles-1",
          "relationships": {
            "comments": {
              "data": []
            }
          }
        }
      }
      """
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
            "data": { "type": "authors", "id": "authors-1" }
          },
          "comments": {
            "data": []
          }
        }
      }
    }
    """

  Scenario: Updating an unknown resource
    When I send a "PATCH" request to "/articles/articles-404" with the resource
      """
      {
        "data": {
          "type": "articles",
          "id": "articles-404",
          "relationships": {
            "author": {
              "data": { "type": "authors", "id": "authors-404" }
            }
          }
        }
      }
      """
    Then the response status should be 404
