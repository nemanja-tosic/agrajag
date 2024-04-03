@fetching
Feature: Fetching relationships
  A server MUST support fetching relationship data for every relationship URL provided as
  a self link as part of a relationship’s links object.

  See: https://jsonapi.org/format/#fetching-relationships

  Background:
    Given the test data

  Scenario: Fetching a to-one relationship
    When I send a "GET" request to "/articles/articles-1/relationships/author"
    Then the response status should be 200
    And the response body should be:
      """
      {
        "data": {
          "type": "authors",
          "id": "authors-1"
        }
      }
      """

  Scenario: Fetching a to-many relationship
    When I send a "GET" request to "/articles/articles-1/relationships/comments"
    Then the response status should be 200
    And the response body should be:
      """
      {
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
      """
