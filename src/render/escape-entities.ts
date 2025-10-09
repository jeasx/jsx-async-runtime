/**
 * Escapes special HTML entities in a given input string.
 *
 * @param {string} input - The input string to escape.
 * @return {string} The input string with special HTML entities escaped.
 */
export function escapeEntities(input: string): string {
  return escapeHTML(input);
}

/*
The following code was copied from:
https://github.com/SukkaW/fast-escape-html

MIT License

Copyright (c) 2025 Sukka

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const reHtmlEntity = /["&'<>]/;
export function escapeHTML(str: string) {
  const match = reHtmlEntity.exec(str);

  if (match === null) {
    // faster than !match since no type conversion
    return str;
  }

  let escape = "";
  let html = "";

  let index = match.index;
  let lastIndex = 0;
  const len = str.length;

  // iterate from the first match

  /**
   * Adjust order for commonly seen symbols:
   * Take https://tc39.es/ecma262 as an example,
   *
   * < 369266
   * > 369296, though sometimes it is more common, it alomost always comes after <
   * " 277105, people seems always prefer " over ' in HTML
   * ' 484, less often, but sometimes is used for attribute anyway
   * & 4424
   */

  for (; index < len; index++) {
    switch (str.charCodeAt(index)) {
      case 60: // <
        escape = "&lt;";
        break;
      case 62: // >
        escape = "&gt;";
        break;
      case 34: // "
        escape = "&quot;";
        break;
      case 39: // '
        escape = "&#39;";
        break;
      case 38: // &
        escape = "&amp;";
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.slice(lastIndex, index);
    }
    html += escape;

    lastIndex = index + 1;
  }

  if (lastIndex !== index) {
    html += str.slice(lastIndex, index);
  }

  return html;
}
