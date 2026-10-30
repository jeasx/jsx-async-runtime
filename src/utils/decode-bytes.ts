import { isByteArray } from "./is-byte-array.js";
import { isPromise } from "./is-promise.js";

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

/**
 * Decodes `bytes` (the child at `index`, or what the promise there resolved to) together with
 * the bytes that follow it as one text, so a character split between them is decoded correctly,
 * like in an async iterable. `decoder` continues the bytes before a promise, if any.
 * Returns the text, the index of the last bytes it decoded, and the decoder when it is still open:
 * a promise after the bytes may resolve to bytes that complete a character, so the caller passes
 * the decoder on, and finishes it with `decoder.decode()` when the promise resolves to anything else.
 */
export function decodeByteRun(
  children: JSX.Element[],
  index: number,
  bytes: Uint8Array,
  decoder = new TextDecoder(),
): [string, number, TextDecoder | undefined] {
  let text = decoder.decode(bytes, { stream: true });
  while (isByteArray(children[index + 1])) {
    text += decoder.decode(children[++index] as Uint8Array, { stream: true });
  }
  if (isPromise(children[index + 1])) {
    return [text, index, decoder];
  }
  // Bytes of a character cut off at the end render as the replacement character "�".
  return [text + decoder.decode(), index, undefined];
}

/**
 * Decodes the byte items of an iterator or async iterable (e.g. the chunks of a `fetch()` body)
 * as UTF-8 text. One decoder for consecutive byte items, so a character split between two of them
 * is decoded correctly. Created at the first byte item, so other iterators need none.
 */
export type ByteDecoding = {
  decoder: TextDecoder | undefined;
};

/**
 * Decodes a byte item as text. A character split between this item and the next
 * stays in the decoder until the next bytes (or finishDecoding()) complete it.
 */
export function decodeItem(state: ByteDecoding, bytes: Uint8Array): string {
  state.decoder ??= new TextDecoder();
  return state.decoder.decode(bytes, { stream: true });
}

/**
 * Returns the text left in the decoder once the byte items ended, or `""`.
 * The decoder only holds text when the bytes ended within a character,
 * which renders as the replacement character "�".
 */
export function finishDecoding(state: ByteDecoding): string {
  const rest = state.decoder?.decode() ?? "";
  state.decoder = undefined;
  return rest;
}
