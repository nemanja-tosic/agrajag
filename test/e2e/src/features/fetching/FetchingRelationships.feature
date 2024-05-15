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

#FIXME: in order to get status 200, relationship/photographer needs to be set to null

#  Scenario: Fetching a to-one relationship with empty data
#    When I send a "GET" request to "/photos/photos-1/relationships/photographer"
#    Then the response status should be 200
#    And the response body should be:
#      """
#      {
#        "data": null
#      }
#      """

  Scenario: Fetching a to-many relationship with empty data
    When I send a "GET" request to "/articles/articles-3/relationships/comments"
    Then the response status should be 200
    And the response body should be:
      """
      {
        "data": []
      }
      """

  Scenario: Fetching a relationship link URL that does not exist
    When I send a "GET" request to "/articles/articles-5/relationships/author"
    Then the response status should be 404
