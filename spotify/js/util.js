/* Shared helpers. Everything hangs off one global so the files stay plain
   <script> tags — same approach the Sandburg app takes. */
window.SP = window.SP || {};

SP.util = (function () {
  "use strict";

  var PREFIX = "spotify:";

  function $(id) { return document.getElementById(id); }

  function el(tag, attrs, kids) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var val = attrs[key];
        if (val === null || val === undefined || val === false) return;
        if (key === "class") node.className = val;
        else if (key === "text") node.textContent = val;
        else if (key === "html") node.innerHTML = val;
        else if (key.slice(0, 2) === "on") node.addEventListener(key.slice(2), val);
        else node.setAttribute(key, val === true ? "" : val);
      });
    }
    (kids || []).forEach(function (kid) {
      if (kid === null || kid === undefined) return;
      node.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    });
    return node;
  }

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
    return node;
  }

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false; /* private mode or a full quota */
    }
  }

  function drop(key) {
    try { localStorage.removeItem(PREFIX + key); } catch (err) { /* ignore */ }
  }

  /* ---- formatting ---- */

  function int(n) {
    return Math.round(n || 0).toLocaleString();
  }

  function minutes(ms) {
    return Math.round((ms || 0) / 60000);
  }

  /* "3 hr 12 min" — the headline format for a chunk of listening time. */
  function duration(ms) {
    var total = Math.round((ms || 0) / 1000);
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    if (h >= 24) {
      var d = Math.floor(h / 24);
      return d.toLocaleString() + " d " + (h % 24) + " hr";
    }
    if (h) return h.toLocaleString() + " hr " + m + " min";
    if (m) return m + " min " + s + " sec";
    return s + " sec";
  }

  function clock(ms) {
    var total = Math.round((ms || 0) / 1000);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  var DAY_MS = 86400000;

  function dateKey(d) {
    /* Local-time YYYY-MM-DD — history is about the listener's clock, not UTC. */
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return y + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }

  function monthKey(d) {
    var m = d.getMonth() + 1;
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m;
  }

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function monthLabel(ym) {
    var bits = ym.split("-");
    return MONTHS[Number(bits[1]) - 1] + " " + bits[0];
  }

  function dayLabel(iso) {
    var d = new Date(iso + "T12:00:00");
    return MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  function hourLabel(h) {
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    return (h % 12) + (h < 12 ? " AM" : " PM");
  }

  function ago(date) {
    var diff = Date.now() - date.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return Math.round(diff / 60000) + " min ago";
    if (diff < DAY_MS) return Math.round(diff / 3600000) + " hr ago";
    if (diff < DAY_MS * 7) return Math.round(diff / DAY_MS) + " days ago";
    return dayLabel(dateKey(date));
  }

  /* ---- misc ---- */

  function topOf(map, n, key) {
    var out = [];
    map.forEach(function (value) { out.push(value); });
    out.sort(function (a, b) { return b[key] - a[key]; });
    return n ? out.slice(0, n) : out;
  }

  function debounce(fn, wait) {
    var timer = null;
    return function () {
      var args = arguments, self = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }

  function art(images, size) {
    if (!images || !images.length) return null;
    /* Spotify sorts widest first; take the smallest that still covers `size`. */
    var best = images[0];
    for (var i = 0; i < images.length; i++) {
      if (images[i].width && images[i].width >= size) best = images[i];
    }
    return best.url;
  }

  return {
    $: $, el: el, clear: clear,
    load: load, save: save, drop: drop,
    int: int, minutes: minutes, duration: duration, clock: clock,
    dateKey: dateKey, monthKey: monthKey, monthLabel: monthLabel, dayLabel: dayLabel,
    hourLabel: hourLabel, ago: ago,
    MONTHS: MONTHS, WEEKDAYS: WEEKDAYS, DAY_MS: DAY_MS,
    topOf: topOf, debounce: debounce, art: art
  };
})();
