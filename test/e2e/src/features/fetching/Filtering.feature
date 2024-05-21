Feature: Filtering

  Background:
    Given the test data

#  Scenario: Filtering data
#    When I send a "GET" request to "articles?filter[title]=Foo1"
#    Then the response status should be 200
#    And the response body should be:
#      """
#     {
#  "data": [
#    {
#      "type": "articles",
#      "id": "articles-3",
#      "attributes": {
#        "title": "Foo1",
#        "body": "Bar",
#        "tags": ["Baz"]
#      },
#      "relationships": {
#        "author": {
#          "data": {
#            "type": "authors",
#            "id": "authors-1"
#          }
#        },
#        "comments": {
#          "data": []
#        }
#      }
#    }
#  ]
#}
#      """
