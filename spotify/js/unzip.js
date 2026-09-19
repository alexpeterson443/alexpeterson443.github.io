/* A read-only ZIP reader, so the Spotify data export can be dropped in as the
   .zip that lands in your inbox instead of being unpacked first.

   Only what a Spotify export needs: stored and deflated entries, with the
   inflating handed to the browser's own DecompressionStream. */
window.SP = window.SP || {};

SP.unzip = (function () {
  "use strict";

  var EOCD_SIG = 0x06054b50;
  var EOCD64_LOCATOR_SIG = 0x07064b50;
  var EOCD64_SIG = 0x06064b50;
  var CENTRAL_SIG = 0x02014b50;
  var LOCAL_SIG = 0x04034b50;
  var U32_MAX = 0xffffffff;

  function supported() {
    return typeof DecompressionStream === "function";
  }

  function findEocd(view) {
    /* The comment field can push the record up to 64 KB from the end. */
    var max = Math.min(view.byteLength, 0xffff + 22);
    for (var i = 22; i <= max; i++) {
      var at = view.byteLength - i;
      if (view.getUint32(at, true) === EOCD_SIG) return at;
    }
    return -1;
  }

  function u64(view, at) {
    var lo = view.getUint32(at, true);
    var hi = view.getUint32(at + 4, true);
    return hi * 4294967296 + lo;
  }

  function readZip64Extra(view, at, len, needs) {
    var end = at + len;
    while (at + 4 <= end) {
      var id = view.getUint16(at, true);
      var size = view.getUint16(at + 2, true);
      var body = at + 4;
      if (id === 0x0001) {
        if (needs.uncompressed) { needs.uncompressedSize = u64(view, body); body += 8; }
        if (needs.compressed) { needs.compressedSize = u64(view, body); body += 8; }
        if (needs.offset) { needs.localOffset = u64(view, body); body += 8; }
        return needs;
      }
      at += 4 + size;
    }
    return needs;
  }

  /* Returns [{ name, size, compressedSize, method, read() -> Promise<Uint8Array> }]. */
  function entries(buffer) {
    var view = new DataView(buffer);
    var bytes = new Uint8Array(buffer);
    var eocd = findEocd(view);
    if (eocd < 0) throw new Error("That doesn't look like a .zip file.");

    var count = view.getUint16(eocd + 10, true);
    var cdOffset = view.getUint32(eocd + 16, true);

    if (cdOffset === U32_MAX || count === 0xffff) {
      var locator = eocd - 20;
      if (locator >= 0 && view.getUint32(locator, true) === EOCD64_LOCATOR_SIG) {
        var eocd64 = u64(view, locator + 8);
        if (view.getUint32(eocd64, true) === EOCD64_SIG) {
          count = u64(view, eocd64 + 32);
          cdOffset = u64(view, eocd64 + 48);
        }
      }
    }

    var decoder = new TextDecoder("utf-8");
    var list = [];
    var at = cdOffset;

    for (var i = 0; i < count; i++) {
      if (at + 46 > view.byteLength || view.getUint32(at, true) !== CENTRAL_SIG) break;
      var method = view.getUint16(at + 10, true);
      var compressedSize = view.getUint32(at + 20, true);
      var uncompressedSize = view.getUint32(at + 24, true);
      var nameLen = view.getUint16(at + 28, true);
      var extraLen = view.getUint16(at + 30, true);
      var commentLen = view.getUint16(at + 32, true);
      var localOffset = view.getUint32(at + 42, true);
      var name = decoder.decode(bytes.subarray(at + 46, at + 46 + nameLen));

      if (uncompressedSize === U32_MAX || compressedSize === U32_MAX || localOffset === U32_MAX) {
        var fixed = readZip64Extra(view, at + 46 + nameLen, extraLen, {
          uncompressed: uncompressedSize === U32_MAX,
          compressed: compressedSize === U32_MAX,
          offset: localOffset === U32_MAX
        });
        if (fixed.uncompressedSize !== undefined) uncompressedSize = fixed.uncompressedSize;
        if (fixed.compressedSize !== undefined) compressedSize = fixed.compressedSize;
        if (fixed.localOffset !== undefined) localOffset = fixed.localOffset;
      }

      list.push(makeEntry(name, method, compressedSize, uncompressedSize, localOffset, view, bytes));
      at += 46 + nameLen + extraLen + commentLen;
    }

    return list;
  }

  function makeEntry(name, method, compressedSize, size, localOffset, view, bytes) {
    return {
      name: name,
      size: size,
      compressedSize: compressedSize,
      method: method,
      directory: name.charAt(name.length - 1) === "/",
      read: function () {
        return Promise.resolve().then(function () {
          if (view.getUint32(localOffset, true) !== LOCAL_SIG) {
            throw new Error("Damaged entry in the zip: " + name);
          }
          /* The local header repeats the name and carries its own extra
             field, which is often a different length from the central one. */
          var nameLen = view.getUint16(localOffset + 26, true);
          var extraLen = view.getUint16(localOffset + 28, true);
          var start = localOffset + 30 + nameLen + extraLen;
          var slice = bytes.subarray(start, start + compressedSize);
          if (method === 0) return slice;
          if (method !== 8) throw new Error("Unsupported compression in the zip (method " + method + ").");
          if (!supported()) {
            throw new Error("This browser can't unzip in-page — unzip the export first, then drop the JSON files in.");
          }
          var stream = new Blob([slice]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
          return new Response(stream).arrayBuffer().then(function (out) {
            return new Uint8Array(out);
          });
        });
      },
      text: function () {
        return this.read().then(function (out) { return new TextDecoder("utf-8").decode(out); });
      }
    };
  }

  return { entries: entries, supported: supported };
})();
