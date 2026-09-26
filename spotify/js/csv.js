/* A CSV reader, because Apple ships listening history as CSV where Spotify
   ships JSON. RFC 4180 rules: quoted fields, doubled quotes inside them,
   commas and newlines inside quotes, CRLF or LF, and a BOM at the front.

   Rows are handed to a callback rather than collected, so a 200 MB
   Play Activity export doesn't become an array of two million arrays. */
window.SP = window.SP || {};

SP.csv = (function () {
  "use strict";

  /* Calls onRow(fields) for every row, header included. Returns the count. */
  function parse(text, onRow) {
    var length = text.length;
    var at = 0;
    if (length && text.charCodeAt(0) === 0xfeff) at = 1; /* BOM */

    var rows = 0;
    var field = "";
    var fields = [];
    var quoted = false;
    var started = false;

    function endField() {
      fields.push(field);
      field = "";
      started = false;
    }

    function endRow() {
      endField();
      /* A trailing newline shouldn't invent a blank row. */
      if (fields.length > 1 || fields[0] !== "") {
        rows++;
        onRow(fields);
      }
      fields = [];
    }

    while (at < length) {
      var ch = text.charAt(at);

      if (quoted) {
        if (ch === '"') {
          if (text.charAt(at + 1) === '"') { field += '"'; at += 2; continue; }
          quoted = false;
          at++;
          continue;
        }
        field += ch;
        at++;
        continue;
      }

      if (ch === '"' && !started) { quoted = true; started = true; at++; continue; }
      if (ch === ",") { endField(); at++; continue; }
      if (ch === "\r") {
        endRow();
        at += text.charAt(at + 1) === "\n" ? 2 : 1;
        continue;
      }
      if (ch === "\n") { endRow(); at++; continue; }

      field += ch;
      started = true;
      at++;
    }

    if (field !== "" || fields.length) endRow();
    return rows;
  }

  function rows(text) {
    var out = [];
    parse(text, function (fields) { out.push(fields); });
    return out;
  }

  function key(name) {
    return String(name || "").replace(/^﻿/, "").trim().toLowerCase().replace(/[\s_-]+/g, " ");
  }

  /* Column lookup that survives Apple renaming things between exports: ask for
     several candidate headers and take the first one the file actually has. */
  function columns(header) {
    var byName = Object.create(null);
    header.forEach(function (name, index) {
      var k = key(name);
      if (k && !(k in byName)) byName[k] = index;
    });

    return {
      names: header,
      has: function (name) { return key(name) in byName; },
      /* pick("song name", "content name", ...) -> index, or -1 */
      pick: function () {
        for (var i = 0; i < arguments.length; i++) {
          var index = byName[key(arguments[i])];
          if (index !== undefined) return index;
        }
        return -1;
      }
    };
  }

  function value(fields, index) {
    if (index < 0 || index >= fields.length) return "";
    return fields[index].trim();
  }

  return { parse: parse, rows: rows, columns: columns, value: value, key: key };
})();
