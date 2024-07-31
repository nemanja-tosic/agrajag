Feature: Update a resources relationships directly

  Background:
    Given the test data

  Scenario: Adding to a to-many relationship
    When I send a "POST" request to "/articles/articles-1/relationships/comments" with the resource
      """
      {
        "data": [
          { "type": "comments", "id": "comments-3" }
        ]
      }
      """
    Then the response status should be 200
    And the response body should be:
      """
      {
        "data": [
          { "type": "comments", "id": "comments-1" },
          { "type": "comments", "id": "comments-2" },
          { "type": "comments", "id": "comments-3" }
        ]
      }
      """

  Scenario: Adding existing item to a to-many relationship
    When I send a "POST" request to "/articles/articles-1/relationships/comments" with the resource
      """
      {
        "data": [
          { "type": "comments", "id": "comments-1" }
        ]
      }
      """
    Then the response status should be 200
    And the response body should be:
      """
      {
        "data": [
          { "type": "comments", "id": "comments-1" },
          { "type": "comments", "id": "comments-2" }
        ]
      }
      """

  Scenario: Updating a to-many relationship
    When I send a "PATCH" request to "/articles/articles-1/relationships/comments" with the resource
      """
      {
        "data": [
          { "type": "comments", "id": "comments-3" }
        ]
      }
      """
    Then the response status should be 200
    And the response body should be:
      """
      {
        "data": [
          { "type": "comments", "id": "comments-3" }
        ]
      }
      """

  Scenario: Clearing a to-many relationship
    When I send a "PATCH" request to "/articles/articles-1/relationships/comments" with the resource
      """
      {
        "data": []
      }
      """
    Then the response status should be 200
    And the response body should be:
      """
      {
        "data": []
      }
      """

  Scenario: Updating an unknown resource
    When I send a "PATCH" request to "/articles/articles-404/relationships/comments" with the resource
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
