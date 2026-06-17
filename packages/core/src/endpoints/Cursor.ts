/**
 * Opaque pagination cursor. Encodes the boundary row's effective sort-key values
 * plus its id (the tiebreaker), so a resolver can turn `page[after]`/`page[before]`
 * into a keyset predicate. Opaque to clients — encode/decode live here so every
 * resolver and the serializer agree on the format.
 */
export interface CursorPayload {
  /** Values of the effective sort keys for the boundary row, in sort order. */
  values: unknown[];
  /** Unique tiebreaker — the resource id. */
  id: string;
}

export function encodeCursor(payload: CursorPayload): string {
  return base64UrlEncode(JSON.stringify(payload));
}

export function decodeCursor(cursor: string): CursorPayload {
  return JSON.parse(base64UrlDecode(cursor)) as CursorPayload;
}

// Portable base64url (works under Node and Workers — no Buffer).
function base64UrlEncode(value: string): string {
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(value: string): string {
  return decodeURIComponent(escape(atob(value.replace(/-/g, '+').replace(/_/g, '/'))));
}
