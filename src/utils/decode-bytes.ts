// Used without the `stream` option, it keeps no state between calls, so one instance is shared.
const textDecoder = new TextDecoder();

/**
 * Decodes bytes that come in one piece (e.g. a `Buffer` from `readFile()`) as UTF-8 text.
 * Bytes that are items of a sequence are decoded with a ByteDecoding instead,
 * so a character split between two items is decoded correctly.
 */
export function decodeBytes(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}

/**
 * Decodes the byte items of a sequence (children, an iterator or an async iterable), e.g. the
 * chunks of a `fetch()` body, as UTF-8 text. Consecutive byte items share one decoder, so
 * a character split between two of them is decoded correctly, even with a promise of bytes between
 * them. The decoder is created at the first byte item and ended by the next item that isn't bytes.
 */
export type ByteDecoding = {
  decoder: TextDecoder | undefined;
};

export function createByteDecoding(): ByteDecoding {
  return { decoder: undefined };
}

/**
 * Decodes a byte item as text. A character split between this item and the next
 * stays in the decoder until the next bytes (or finishDecoding()) complete it.
 */
export function decodeItem(state: ByteDecoding, bytes: Uint8Array): string {
  state.decoder ??= new TextDecoder();
  return state.decoder.decode(bytes, { stream: true });
}

/**
 * Ends the decoder and returns the text left in it, or `""`.
 * The decoder only holds text when the bytes ended within a character,
 * which renders as the replacement character "�".
 */
export function finishDecoding(state: ByteDecoding): string {
  const rest = state.decoder?.decode() ?? "";
  state.decoder = undefined;
  return rest;
}
