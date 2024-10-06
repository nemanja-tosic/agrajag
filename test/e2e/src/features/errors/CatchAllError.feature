Feature: Catch all error
  Scenario: Processing error while fetching a resource
    When I send a "GET" request to "/errors"
    Then the response status should be 500
    And the response body should be:
      """
      {
        "errors": [
          {
            "status": "500",
            "title": "Internal Server Error",
            "detail": "An unexpected error occurred"
          }
        ]
      }
      """

  Scenario: Processing error while creating a resource
    When I send a "POST" request to "/errors" with the resource
      """
      {
        "data": {
          "type": "errors",
          "attributes": {
            "message": "An error occurred"
          }
        }
      }
      """
    Then the response status should be 500
    And the response body should be:
      """
      {
        "errors": [
          {
            "status": "500",
            "title": "Internal Server Error",
            "detail": "An unexpected error occurred"
          }
        ]
      }
      """
