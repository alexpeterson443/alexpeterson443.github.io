/* Node smoke test for the in-page ZIP reader, run against a real archive
   built by python's zipfile. Run with: node spotify/test/unzip.test.js */
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");
var child = require("child_process");
var os = require("os");

var JS = path.join(__dirname, "..", "js");
var sandbox = {
  console: console, TextDecoder: TextDecoder, Blob: Blob, Response: Response,
  DecompressionStream: DecompressionStream, DataView: DataView, Uint8Array: Uint8Array
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(JS, "unzip.js"), "utf8"), sandbox, { filename: "unzip.js" });
var unzip = sandbox.SP.unzip;

var failures = 0;
function check(label, actual, expected) {
  var ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) { failures++; console.error("FAIL  " + label + "\n  expected " + JSON.stringify(expected) + "\n  got      " + JSON.stringify(actual)); }
  else console.log("ok    " + label);
}

var dir = fs.mkdtempSync(path.join(os.tmpdir(), "zip-"));
var zipPath = path.join(dir, "export.zip");
/* One deflated entry (big enough that zipfile actually compresses it), one
   stored entry, and a nested path like the real export uses. */
var big = JSON.stringify(Array.from({ length: 400 }, function (_, i) {
  return { ts: "2024-01-01T00:0" + (i % 6) + ":00Z", ms_played: 1000 + i,
           master_metadata_track_name: "Track " + i, master_metadata_album_artist_name: "Artist" };
}));
fs.writeFileSync(path.join(dir, "history.json"), big);
fs.writeFileSync(path.join(dir, "tiny.txt"), "hi");

child.execFileSync("python3", ["-c", [
  "import zipfile, sys",
  "z = zipfile.ZipFile(sys.argv[1], 'w')",
  "z.write(sys.argv[2], 'MyData/Streaming_History_Audio_2024_0.json', zipfile.ZIP_DEFLATED)",
  "z.write(sys.argv[3], 'MyData/Read_Me_First.txt', zipfile.ZIP_STORED)",
  "z.close()"
].join("\n"), zipPath, path.join(dir, "history.json"), path.join(dir, "tiny.txt")]);

var buffer = fs.readFileSync(zipPath);
var entries = unzip.entries(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));

check("entry count", entries.length, 2);
check("entry names", entries.map(function (e) { return e.name; }),
  ["MyData/Streaming_History_Audio_2024_0.json", "MyData/Read_Me_First.txt"]);
check("deflated entry uses method 8", entries[0].method, 8);
check("stored entry uses method 0", entries[1].method, 0);

Promise.all([entries[0].text(), entries[1].text()]).then(function (out) {
  check("deflated entry inflates to the original", out[0] === big, true);
  check("deflated entry parses as JSON", JSON.parse(out[0]).length, 400);
  check("stored entry reads", out[1], "hi");

  try {
    unzip.entries(new Uint8Array([1, 2, 3, 4, 5]).buffer);
    check("non-zip rejected", "no error", "an error");
  } catch (err) {
    check("non-zip rejected", /zip/i.test(err.message), true);
  }

  fs.rmSync(dir, { recursive: true, force: true });
  console.log(failures ? "\n" + failures + " failing check(s)" : "\nall checks passed");
  process.exit(failures ? 1 : 0);
}).catch(function (err) {
  console.error(err);
  process.exit(1);
});
