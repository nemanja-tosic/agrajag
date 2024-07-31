Feature: Deleting

  Background:
    Given the test data

  Scenario: Deleting a resource
    When I send a "DELETE" request to "/articles/articles-3"
    Then the response status should be 200

  Scenario: Deleting a relationship
    When I send a "DELETE" request to "/articles/articles-1/relationships/comments"
    Then the response status should be 200

  Scenario: Deleting a non-existing resource
    When I send a "DELETE" request to "/articles/test"
    Then the response status should be 404

  Scenario: Deleting a non-existing relationship
    When I send a "DELETE" request to "/articles/articles-1/relationships/test"
    Then the response status should be 404
