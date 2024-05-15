Feature: Sorting

  Background:
    Given the test data

  Scenario: Fetching sorted resources
    When I send a "GET" request to '/authors?sort=name'
    Then the response status should be 200
    And the response body should be:
    """
        {
          "data": [
            {
              "type": "authors",
              "id": "authors-2",
              "attributes": {
                "name": "Dunja",
                "category": "Crochet"
              }
            },
            {
              "type": "authors",
              "id": "authors-1",
              "attributes": {
                "name": "Nemanja",
                "category": "IT"
              }
            }
          ]
        }
    """

  Scenario: Fetching sorted resources descending
    When I send a "GET" request to '/authors?sort=-name'
    Then the response status should be 200
    And the response body should be:
    """
        {
          "data": [
            {
              "type": "authors",
              "id": "authors-1",
              "attributes": {
                "name": "Nemanja",
                "category": "IT"
              }
            },
            {
              "type": "authors",
              "id": "authors-2",
              "attributes": {
                "name": "Dunja",
                "category": "Crochet"
              }
            }
          ]
        }
    """
#fixme: should fail but getting 200?
#  Scenario: Fetching nested resources
#    When I send a "GET" request to '/articles?sort=-title, comments.body'
#    Then the response status should be 400