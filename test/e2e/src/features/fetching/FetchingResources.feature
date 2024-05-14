@fetching
Feature: Fetching resources
  A server MUST support fetching resource data for every URL provided as:

  * a self link as part of the top-level links object
  * a self link as part of a resource-level links object
  * a related link as part of a relationship-level links object

  See: https://jsonapi.org/format/#fetching-resources

  Background:
    Given the test data

  Scenario: Fetching a collection of resources
    When I send a "GET" request to "/authors"
    Then the response status should be 200
    And the response body should be:
      """
      {
        "data": [
          {
            "type": "authors",
            "id": "authors-1",
            "attributes": {
              "category": "IT",
              "name": "Nemanja"
            }
          },
          {
            "type": "authors",
            "id": "authors-2",
            "attributes": {
              "category": "Crochet",
              "name": "Dunja"
            }
          }
        ]
      }
      """

  Scenario: Fetching a resource
    When I send a "GET" request to "/authors/authors-1"
    Then the response status should be 200
    And the response body should be:
      """
      {
        "data": {
          "type": "authors",
          "id": "authors-1",
          "attributes": {
            "name": "Nemanja",
            "category": "IT"
          }
        }
      }
      """

  Scenario: Fetching an empty collection of resources
    When I send a "GET" request to "/empty"
    Then the response status should be 200
    And the response body should be:
      """
      {
        "data": []
      }
      """

 #FIXME: need to create an empty resource in the collection
#  Scenario: Fetching an empty resource
#    When I send a "GET" request to "/authors1/authors-3"
#    Then the response status should be 200
#    And the response body should be:
#      """
#      {
#        "data": null
#      }
#      """

  Scenario: Fetching a resource that does not exist
    When I send a "GET" request to "/authors/authors-404"
    Then the response status should be 404
