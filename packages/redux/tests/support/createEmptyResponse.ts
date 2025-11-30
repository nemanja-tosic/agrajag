export function createEmptyResponse() {
  return new Response(undefined, {
    status: 204,
    headers: { 'Content-Type': 'application/vnd.api+json' },
  });
}
