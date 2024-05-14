Feature: Sorting

  Background:
    Given the test data

  # FIXME: Sorting not working?
#  Scenario: Fetching sorted resources
#    When I send a "GET" request to '/authors?sort=name'
#    Then the response status should be 200
#    And the response body should be:
#    """
#        {
#          "data": [
#            {
#              "type": "authors",
#              "id": "authors-2",
#              "attributes": {
#                "name": "Dunja",
#                "category": "Crochet"
#              }
#            },
#            {
#              "type": "authors",
#              "id": "authors-1",
#              "attributes": {
#                "name": "Nemanja",
#                "category": "IT"
#              }
#            }
#          ]
#        }
#    """
#
#  Scenario: Fetching sorted resources descending
#    When I send a "GET" request to '/authors?sort=-id,name'
#    Then the response status should be 200
#    And the response body should be:
#    """
#        {
#          "data": [
#            {
#              "type": "authors",
#              "id": "authors-2",
#              "attributes": {
#                "name": "Dunja",
#                "category": "Crochet"
#              }
#            },
#            {
#              "type": "authors",
#              "id": "authors-1",
#              "attributes": {
#                "name": "Nemanja",
#                "category": "IT"
#              }
#            }
#          ]
#        }
#    """
