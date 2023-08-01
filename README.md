## Reorg Handler
Endpoint: `/v1/reorg-handler`

The Reorg Handler provides an endpoint to handle blockchain reorganizations. It takes in the last valid block number and the corresponding schema to handle the reorganization accordingly.

### Type

This handler function does not specifically return a structured object. It returns an appropriate response based on the provided parameters.

### Query Params:

- `last_valid_block`: The last block number that is considered valid. It's used to determine the point at which the reorganization must be handled. Type: `number`.
- `schema`: The schema to be used in handling the reorganization. Type: `string`.

### Request Headers:

- The request may include standard HTTP headers.

### Response:

- `200 OK`: Successful handling of the reorganization.
- `400 BAD REQUEST`: If the `last_valid_block` or `schema` parameters are missing, the endpoint will return a 400 Bad Request status code with the message "Missing parameters."

### Example Usage:

To invoke the reorg handler with a specific block number and schema, you can make an HTTP request to the endpoint:

```http
GET /v1/reorg-handler?last_valid_block=12345&schema=mySchema
```

### Code Implementation:

The handler function for this endpoint is implemented in the `createReorgHandler` function, which accepts the reorg components and returns the request handler to process the reorganization.

### Note:

Make sure to provide both the `last_valid_block` and `schema` parameters in the query string for the handler to process the reorganization correctly. If any of these parameters are missing, the handler will return a bad request response.
