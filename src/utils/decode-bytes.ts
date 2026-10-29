// Used without the `stream` option, it keeps no state between calls, so one instance is shared.
const textDecoder = new TextDecoder();

/**
 * Decodes bytes that come in one piece (e.g. a `Buffer` from `readFile()`) as UTF-8 text.
 * Bytes that come in chunks need their own decoder with the `stream` option,
 * so a character split between two chunks is decoded correctly.
 */
export function decodeBytes(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}
