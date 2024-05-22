Feature: Deleting

  Background:
    Given the test data

  #fixme: it is expecting json input
  Scenario: Deleting a resource
    When I send a "DELETE" request to "articles/articles-3"
    Then the response status should be 200




