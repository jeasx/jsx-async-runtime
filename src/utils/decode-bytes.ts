import { isByteArray } from "./is-byte-array.js";

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
 * Checks if the child at `index` and the one after it are both bytes,
 * e.g. chunks collected from a stream or yielded by a generator.
 */
export function isByteRun(children: JSX.Element[], index: number): boolean {
  return isByteArray(children[index]) && isByteArray(children[index + 1]);
}

/**
 * Decodes the bytes at `index` together with the bytes that follow it as one text,
 * so a character split between two of them is decoded correctly, like in an async iterable.
 * Returns the text and the index of the last bytes it decoded.
 */
export function decodeByteRun(children: JSX.Element[], index: number): [string, number] {
  const decoder = new TextDecoder();
  let text = "";
  for (; index < children.length && isByteArray(children[index]); index++) {
    text += decoder.decode(children[index] as Uint8Array, { stream: true });
  }
  // Bytes of a character cut off at the end render as the replacement character "�".
  return [text + decoder.decode(), index - 1];
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
