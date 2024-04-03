Feature: Updating a resources attributes
  A resource can be updated by sending a PATCH request to the URL that represents the resource.

  The URL for a resource can be obtained in the self link of the resource object.
  Alternatively, when a GET request returns a single resource object as primary data, the same request URL
  can be used for updates.

  The PATCH request MUST include a single resource object as primary data.
  The resource object MUST contain type and id members.

  ```
  PATCH /articles/1 HTTP/1.1
  Content-Type: application/vnd.api+json
  Accept: application/vnd.api+json

  {
    "data": {
      "type": "articles",
      "id": "articles-1",
      "attributes": {
        "title": "Foobar"
      }
    }
  }
  ```

  @WIP
  Scenario: Updating a resources attributes
    Given the test data
    When I send a "PATCH" request to "/articles/1" with the resource
      """
      {
        "data": {
          "type": "articles",
          "id": "articles-1",
          "attributes": {
            "title": "Foobar"
          }
        }
      }
      """
    Then the response status should be 200
    And the response body should be:
      """
      {
        "data": {
          "type": "articles",
          "id": "articles-1",
          "attributes": {
            "title": "Foobar",
            "body": "Bar",
            "tags": ["Baz"]
          },
          "relationships": {
            "author": {
              "data": { "type": "authors", "id": "authors-1" }
            },
            "comments": {
              "data": [
                { "type": "comments", "id": "comments-1" },
                { "type": "comments", "id": "comments-2" }
              ]
            }
          }
        }
      }
      """
