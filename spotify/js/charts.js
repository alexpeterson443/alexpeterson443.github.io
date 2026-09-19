/* Chart primitives. Hand-rolled SVG and HTML — no library, so the page stays
   one folder of static files.

   House rules, applied everywhere below: thin marks with rounded data ends, a
   2px gap between neighbouring fills, values direct-labelled rather than
   written on every gridline, recessive axes, a hover readout on every plot,
   and a table view under each chart for anyone the colours fail. */
window.SP = window.SP || {};

SP.charts = (function () {
  "use strict";

  var util = SP.util;
  var el = util.el;
  var NS = "http://www.w3.org/2000/svg";
  var tip = null;

  function svgEl(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (attrs[key] === null || attrs[key] === undefined) return;
        node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  /* ---- shared hover readout ---- */

  function tooltip() {
    if (!tip) {
      tip = el("div", { class: "viz-tip", role: "status", "aria-live": "polite" });
      document.body.appendChild(tip);
    }
    return tip;
  }

  function showTip(event, html) {
    var node = tooltip();
    node.innerHTML = html;
    node.classList.add("on");
    var pad = 12;
    var box = node.getBoundingClientRect();
    var x = Math.min(Math.max(event.clientX + pad, 8), window.innerWidth - box.width - 8);
    var y = event.clientY - box.height - pad;
    if (y < 8) y = event.clientY + pad * 2;
    node.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
  }

  function hideTip() {
    if (tip) tip.classList.remove("on");
  }

  document.addEventListener("scroll", hideTip, true);

  function hoverable(node, html) {
    node.addEventListener("pointermove", function (event) { showTip(event, html()); });
    node.addEventListener("pointerleave", hideTip);
    node.addEventListener("focus", function () {
      var rect = node.getBoundingClientRect();
      showTip({ clientX: rect.left + rect.width / 2, clientY: rect.top }, html());
    });
    node.addEventListener("blur", hideTip);
  }

  /* ---- table view ---- */

  function tableView(columns, rows) {
    var head = el("tr", {}, columns.map(function (c) { return el("th", { text: c }); }));
    var body = rows.map(function (row) {
      return el("tr", {}, row.map(function (cell) { return el("td", { text: String(cell) }); }));
    });
    return el("details", { class: "viz-table" }, [
      el("summary", { text: "Table view" }),
      el("div", { class: "viz-table-scroll" }, [
        el("table", {}, [el("thead", {}, [head]), el("tbody", {}, body)])
      ])
    ]);
  }

  function figure(title, note, body, table) {
    return el("figure", { class: "viz" }, [
      title ? el("figcaption", { class: "viz-head" }, [
        el("span", { class: "viz-title", text: title }),
        note ? el("span", { class: "viz-note", text: note }) : null
      ]) : null,
      body,
      table || null
    ]);
  }

  function empty(message) {
    return el("p", { class: "viz-empty", text: message });
  }

  /* ---- ranked horizontal bars ----
     The workhorse: top artists, top tracks, platforms, anything ordered. */

  function rankBars(items, opts) {
    opts = opts || {};
    var value = opts.value || function (d) { return d.value; };
    var label = opts.label || function (d) { return d.name; };
    var format = opts.format || util.int;
    if (!items.length) return figure(opts.title, opts.note, empty(opts.emptyText || "Nothing here yet."));

    var max = items.reduce(function (m, d) { return Math.max(m, value(d)); }, 0) || 1;
    /* A data export carries no cover art, so don't reserve a column of blanks
       for it — only keep the slot when at least one row can fill it. */
    var hasArt = !!opts.art && items.some(function (d) { return !!opts.art(d); });
    var list = el("ol", { class: "rank" });

    items.forEach(function (item, index) {
      var pct = Math.max(1.5, (value(item) / max) * 100);
      var art = hasArt ? opts.art(item) : null;
      var meta = opts.meta ? opts.meta(item) : null;
      var row = el("li", { class: "rank-row" }, [
        el("span", { class: "rank-n", text: String(index + 1) }),
        art ? el("img", { class: "rank-art", src: art, alt: "", loading: "lazy", width: 40, height: 40 })
            : (hasArt ? el("span", { class: "rank-art rank-art-blank", "aria-hidden": "true" }) : null),
        el("span", { class: "rank-body" }, [
          el("span", { class: "rank-label", text: label(item), title: label(item) }),
          meta ? el("span", { class: "rank-meta", text: meta }) : null,
          el("span", { class: "rank-track" }, [
            el("span", { class: "rank-bar", style: "width:" + pct + "%" })
          ])
        ]),
        el("span", { class: "rank-value", text: format(value(item)) })
      ]);
      if (opts.onSelect) {
        row.classList.add("is-clickable");
        row.setAttribute("tabindex", "0");
        row.setAttribute("role", "button");
        row.addEventListener("click", function () { opts.onSelect(item); });
        row.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); opts.onSelect(item); }
        });
      }
      if (opts.tip) {
        hoverable(row, function () { return opts.tip(item); });
      }
      list.appendChild(row);
    });

    var table = tableView(
      [opts.labelHead || "Name", opts.valueHead || "Value"],
      items.map(function (item) { return [label(item), format(value(item))]; })
    );
    return figure(opts.title, opts.note, list, table);
  }

  /* ---- columns over time ---- */

  function columns(items, opts) {
    opts = opts || {};
    var value = opts.value || function (d) { return d.value; };
    var label = opts.label || function (d) { return d.name; };
    var format = opts.format || util.int;
    if (!items.length) return figure(opts.title, opts.note, empty(opts.emptyText || "No data yet."));

    var W = 720, H = opts.height || 210;
    var padL = 8, padR = 8, padT = 12, padB = 26;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var max = items.reduce(function (m, d) { return Math.max(m, value(d)); }, 0) || 1;
    var step = plotW / items.length;
    /* 2px of surface between neighbours, and a ceiling so five columns read
       as bars rather than slabs. */
    var barW = Math.min(opts.maxBar || 36, Math.max(2, step - 2));

    var svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H, class: "viz-svg",
      role: "img", "aria-label": (opts.title || "Chart") + ": " + items.length + " columns"
    });

    /* Two recessive gridlines are enough to read height against. */
    [0.5, 1].forEach(function (frac) {
      var y = padT + plotH - plotH * frac;
      svg.appendChild(svgEl("line", { x1: padL, x2: W - padR, y1: y, y2: y, class: "viz-grid" }));
    });

    items.forEach(function (item, index) {
      var v = value(item);
      var h = Math.max(v > 0 ? 3 : 0, (v / max) * plotH);
      var x = padL + index * step + (step - barW) / 2;
      var y = padT + plotH - h;
      var bar = svgEl("rect", {
        x: x, y: y, width: barW, height: h, rx: Math.min(4, barW / 2),
        class: "viz-bar" + (opts.highlight && opts.highlight(item) ? " is-hot" : "")
      });
      hoverable(bar, function () {
        return "<b>" + label(item) + "</b><br>" + format(v) + (opts.tipExtra ? "<br>" + opts.tipExtra(item) : "");
      });
      bar.setAttribute("tabindex", "0");
      svg.appendChild(bar);

      /* Label every column only when they fit; otherwise thin them out. */
      var everyNth = Math.ceil(items.length / Math.max(4, Math.floor(plotW / 58)));
      if (index % everyNth === 0 || items.length <= 12) {
        svg.appendChild(svgEl("text", {
          x: x + barW / 2, y: H - 8, class: "viz-xlabel", "text-anchor": "middle"
        })).textContent = opts.shortLabel ? opts.shortLabel(item) : label(item);
      }
    });

    var wrap = el("div", { class: "viz-plot" }, [svg]);
    var table = tableView([opts.labelHead || "Period", opts.valueHead || "Value"],
      items.map(function (item) { return [label(item), format(value(item))]; }));
    return figure(opts.title, opts.note, wrap, table);
  }

  /* ---- sequential ramp shared by the grid charts ---- */

  var RAMP = ["seq-1", "seq-2", "seq-3", "seq-4", "seq-5"];

  function binOf(value, max) {
    if (!value) return null;
    var frac = value / max;
    var index = Math.min(RAMP.length - 1, Math.floor(Math.pow(frac, 0.6) * RAMP.length));
    return RAMP[index];
  }

  function rampLegend(max, format) {
    return el("div", { class: "viz-legend" }, [
      el("span", { class: "viz-legend-label", text: "Less" }),
      el("span", { class: "viz-legend-swatches" }, RAMP.map(function (name) {
        return el("span", { class: "viz-cell viz-swatch " + name });
      })),
      el("span", { class: "viz-legend-label", text: "More — up to " + format(max) })
    ]);
  }

  /* ---- weekday x hour heatmap ---- */

  function clockGrid(matrix, opts) {
    opts = opts || {};
    var format = opts.format || util.int;
    var max = 0;
    matrix.forEach(function (row) {
      row.forEach(function (v) { if (v > max) max = v; });
    });
    if (!max) return figure(opts.title, opts.note, empty("No listening logged yet."));

    var grid = el("div", { class: "hgrid" });
    grid.appendChild(el("span", { class: "hgrid-corner" }));
    for (var h = 0; h < 24; h++) {
      grid.appendChild(el("span", {
        class: "hgrid-col" + (h % 6 === 0 ? " is-marked" : ""),
        text: h % 6 === 0 ? util.hourLabel(h).replace(" ", "") : ""
      }));
    }
    matrix.forEach(function (row, day) {
      grid.appendChild(el("span", { class: "hgrid-row", text: util.WEEKDAYS[day] }));
      row.forEach(function (v, hour) {
        var bin = binOf(v, max);
        var cell = el("span", {
          class: "viz-cell" + (bin ? " " + bin : " is-zero"),
          tabindex: v ? "0" : null,
          "aria-label": util.WEEKDAYS[day] + " " + util.hourLabel(hour) + ": " + format(v)
        });
        if (v) {
          hoverable(cell, function () {
            return "<b>" + util.WEEKDAYS[day] + " " + util.hourLabel(hour) + "</b><br>" + format(v);
          });
        }
        grid.appendChild(cell);
      });
    });

    var rows = [];
    matrix.forEach(function (row, day) {
      row.forEach(function (v, hour) {
        if (v) rows.push([util.WEEKDAYS[day], util.hourLabel(hour), format(v)]);
      });
    });
    return figure(opts.title, opts.note,
      el("div", {}, [grid, rampLegend(max, format)]),
      tableView(["Day", "Hour", opts.valueHead || "Value"], rows));
  }

  /* ---- year calendar ---- */

  function calendar(dayMap, year, opts) {
    opts = opts || {};
    var format = opts.format || util.int;
    var start = new Date(year, 0, 1);
    var end = new Date(year, 11, 31);
    var max = 0;
    dayMap.forEach(function (v, key) {
      if (key.slice(0, 4) === String(year) && v > max) max = v;
    });
    if (!max) return null;

    var grid = el("div", { class: "cal" });
    /* Lead-in blanks so every column is a real Sun-to-Sat week. */
    for (var pad = 0; pad < start.getDay(); pad++) {
      grid.appendChild(el("span", { class: "viz-cell is-blank" }));
    }
    var cursor = new Date(start);
    var monthMarks = [];
    while (cursor <= end) {
      var key = util.dateKey(cursor);
      var v = dayMap.get(key) || 0;
      var bin = binOf(v, max);
      var day = util.dayLabel(key);
      var cell = el("span", {
        class: "viz-cell" + (bin ? " " + bin : " is-zero"),
        tabindex: v ? "0" : null,
        "aria-label": day + ": " + (v ? format(v) : "nothing")
      });
      if (v) {
        (function (dayLabel, amount) {
          hoverable(cell, function () { return "<b>" + dayLabel + "</b><br>" + format(amount); });
        })(day, v);
      }
      grid.appendChild(cell);
      if (cursor.getDate() === 1) monthMarks.push({ month: cursor.getMonth(), week: Math.floor((start.getDay() + dayIndex(start, cursor)) / 7) });
      cursor = new Date(cursor.getTime() + util.DAY_MS);
    }

    var months = el("div", { class: "cal-months" }, monthMarks.map(function (mark) {
      return el("span", { class: "cal-month", style: "grid-column:" + (mark.week + 1), text: util.MONTHS[mark.month] });
    }));

    var rows = [];
    dayMap.forEach(function (v, key) {
      if (key.slice(0, 4) === String(year)) rows.push([key, format(v)]);
    });
    rows.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });

    return figure(opts.title || String(year), opts.note,
      el("div", { class: "cal-wrap" }, [months, grid, rampLegend(max, format)]),
      tableView(["Day", opts.valueHead || "Value"], rows));
  }

  function dayIndex(start, date) {
    return Math.round((date - start) / util.DAY_MS);
  }

  /* ---- line over time, with a crosshair ---- */

  function line(points, opts) {
    opts = opts || {};
    var format = opts.format || util.int;
    if (points.length < 2) return columns(points, opts);

    var W = 720, H = opts.height || 200;
    var padL = 8, padR = 8, padT = 14, padB = 26;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var max = points.reduce(function (m, p) { return Math.max(m, p.value); }, 0) || 1;
    var stepX = plotW / (points.length - 1);

    var svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H, class: "viz-svg",
      role: "img", "aria-label": (opts.title || "Trend") + " over " + points.length + " periods"
    });
    [0.5, 1].forEach(function (frac) {
      var y = padT + plotH - plotH * frac;
      svg.appendChild(svgEl("line", { x1: padL, x2: W - padR, y1: y, y2: y, class: "viz-grid" }));
    });

    var coords = points.map(function (p, i) {
      return { x: padL + i * stepX, y: padT + plotH - (p.value / max) * plotH, point: p };
    });
    var d = coords.map(function (c, i) { return (i ? "L" : "M") + c.x.toFixed(1) + " " + c.y.toFixed(1); }).join(" ");
    var area = d + " L" + coords[coords.length - 1].x.toFixed(1) + " " + (padT + plotH) +
               " L" + coords[0].x.toFixed(1) + " " + (padT + plotH) + " Z";
    svg.appendChild(svgEl("path", { d: area, class: "viz-area" }));
    svg.appendChild(svgEl("path", { d: d, class: "viz-line" }));

    var crosshair = svgEl("line", { class: "viz-crosshair", y1: padT, y2: padT + plotH, x1: -10, x2: -10, opacity: 0 });
    var dot = svgEl("circle", { class: "viz-dot", r: 4.5, cx: -10, cy: -10, opacity: 0 });
    svg.appendChild(crosshair);
    svg.appendChild(dot);

    svg.addEventListener("pointermove", function (event) {
      var box = svg.getBoundingClientRect();
      var ratio = (event.clientX - box.left) / box.width;
      var index = Math.round(ratio * (points.length - 1));
      index = Math.max(0, Math.min(points.length - 1, index));
      var c = coords[index];
      crosshair.setAttribute("x1", c.x);
      crosshair.setAttribute("x2", c.x);
      crosshair.setAttribute("opacity", 1);
      dot.setAttribute("cx", c.x);
      dot.setAttribute("cy", c.y);
      dot.setAttribute("opacity", 1);
      showTip(event, "<b>" + c.point.name + "</b><br>" + format(c.point.value));
    });
    svg.addEventListener("pointerleave", function () {
      crosshair.setAttribute("opacity", 0);
      dot.setAttribute("opacity", 0);
      hideTip();
    });

    var everyNth = Math.ceil(points.length / 6);
    points.forEach(function (p, i) {
      if (i % everyNth) return;
      svg.appendChild(svgEl("text", {
        x: padL + i * stepX, y: H - 8, class: "viz-xlabel",
        "text-anchor": i === 0 ? "start" : "middle"
      })).textContent = opts.shortLabel ? opts.shortLabel(p) : p.name;
    });

    return figure(opts.title, opts.note, el("div", { class: "viz-plot" }, [svg]),
      tableView([opts.labelHead || "Period", opts.valueHead || "Value"],
        points.map(function (p) { return [p.name, format(p.value)]; })));
  }

  /* ---- stat tiles: when the number IS the chart ---- */

  function tile(label, value, note) {
    return el("div", { class: "tile" }, [
      el("span", { class: "tile-label", text: label }),
      el("span", { class: "tile-value", text: value }),
      note ? el("span", { class: "tile-note", text: note }) : null
    ]);
  }

  function tiles(list) {
    return el("div", { class: "tiles" }, list.filter(Boolean).map(function (t) {
      return tile(t.label, t.value, t.note);
    }));
  }

  return {
    rankBars: rankBars,
    columns: columns,
    clockGrid: clockGrid,
    calendar: calendar,
    line: line,
    tiles: tiles,
    hideTip: hideTip
  };
})();
