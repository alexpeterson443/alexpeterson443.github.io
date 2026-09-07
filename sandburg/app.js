/* Sandburg Café daily menu — static app over the JSON in /data, refreshed daily by CI. */
(function () {
  "use strict";

  var DATA_URL = new URL("../data/", location.href);
  var TZ = "America/Chicago";
  var DOW = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snacks: "Snacks" };
  var DIETS = ["Vegetarian", "Vegan"];
  var ALLERGENS = ["Milk", "Eggs", "Wheat", "Gluten", "Soy", "Peanuts", "Tree Nuts", "Fish", "Shellfish", "Sesame"];

  var el = {
    days: document.getElementById("days"),
    meals: document.getElementById("meals"),
    menu: document.getElementById("menu"),
    search: document.getElementById("search"),
    dietChips: document.getElementById("dietChips"),
    allergenChips: document.getElementById("allergenChips"),
    allergenCount: document.getElementById("allergenCount"),
    prevDay: document.getElementById("prevDay"),
    nextDay: document.getElementById("nextDay"),
    notice: document.getElementById("notice"),
    favNote: document.getElementById("favNote"),
    updated: document.getElementById("updated"),
    todayJump: document.getElementById("todayJump"),
    favChips: document.getElementById("favChips"),
    status: document.getElementById("status"),
    statusDot: document.getElementById("statusDot"),
    statusText: document.getElementById("statusText")
  };

  var state = {
    index: null,
    date: null,
    meal: null,
    day: null,
    search: "",
    diets: new Set(),
    hidden: new Set(),
    favs: new Set(load("favs", [])),
    favOnly: false,
    open: new Set()
  };

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem("sandburg:" + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem("sandburg:" + key, JSON.stringify(value));
    } catch (err) {
      /* private mode or full quota — preferences just don't persist */
    }
  }

  /* ---- Central-time helpers (the café's clock, not the visitor's) ---- */

  function centralParts(when) {
    var fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false
    });
    var out = {};
    fmt.formatToParts(when || new Date()).forEach(function (part) { out[part.type] = part.value; });
    return {
      date: out.year + "-" + out.month + "-" + out.day,
      minutes: (parseInt(out.hour, 10) % 24) * 60 + parseInt(out.minute, 10),
      weekday: out.weekday.toLowerCase().slice(0, 3)
    };
  }

  function shiftDate(iso, days) {
    var parts = iso.split("-").map(Number);
    var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + days));
    return d.toISOString().slice(0, 10);
  }

  function prettyDate(iso) {
    var parts = iso.split("-").map(Number);
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])).toLocaleDateString(undefined, {
      timeZone: "UTC", weekday: "long", month: "long", day: "numeric"
    });
  }

  function to12h(hhmm) {
    var bits = hhmm.split(":").map(Number);
    var suffix = bits[0] >= 12 ? "pm" : "am";
    var hour = bits[0] % 12 || 12;
    return bits[1] ? hour + ":" + String(bits[1]).padStart(2, "0") + suffix : hour + suffix;
  }

  function mealForNow(minutes) {
    if (minutes < 11 * 60) return "breakfast";
    if (minutes < 16 * 60) return "lunch";
    if (minutes < 20 * 60) return "dinner";
    return "snacks";
  }

  /* ---- data ---- */

  function fetchJSON(path) {
    return fetch(new URL(path, DATA_URL).href, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      return res.json();
    });
  }

  function loadDay(date) {
    return fetchJSON("menus/" + date + ".json").then(function (day) {
      save("day:" + date, day);
      return { day: day, cached: false };
    }).catch(function (err) {
      var cached = load("day:" + date, null);
      if (cached) return { day: cached, cached: true };
      throw err;
    });
  }

  /* ---- rendering ---- */

  function renderDays() {
    var today = centralParts().date;
    var dates = state.index.dates;
    el.days.textContent = "";
    dates.forEach(function (date) {
      var parts = date.split("-").map(Number);
      var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      var button = document.createElement("button");
      button.type = "button";
      button.className = "day" + (date === today ? " today" : "");
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(date === state.date));
      button.dataset.date = date;
      button.innerHTML =
        '<span class="dow">' + (date === today ? "Today" : d.toLocaleDateString(undefined, { timeZone: "UTC", weekday: "short" })) + "</span>" +
        '<span class="dnum">' + d.getUTCDate() + "</span>";
      button.addEventListener("click", function () { selectDate(date); });
      el.days.appendChild(button);
    });
    var selected = el.days.querySelector('[aria-selected="true"]');
    if (selected) selected.scrollIntoView({ block: "nearest", inline: "center" });
    el.todayJump.hidden = state.date === today || dates.indexOf(today) === -1;
    el.prevDay.disabled = dates.indexOf(state.date) <= 0;
    el.nextDay.disabled = dates.indexOf(state.date) === dates.length - 1;
  }

  function renderMeals() {
    var available = state.day ? Object.keys(state.day.meals) : [];
    el.meals.textContent = "";
    state.index.meals.forEach(function (meal) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "meal";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(meal === state.meal));
      button.disabled = available.indexOf(meal) === -1;
      button.textContent = MEAL_LABELS[meal] || meal;
      button.addEventListener("click", function () {
        state.meal = meal;
        renderMeals();
        renderMenu();
      });
      el.meals.appendChild(button);
    });
  }

  function renderChips() {
    el.dietChips.textContent = "";
    DIETS.forEach(function (diet) {
      el.dietChips.appendChild(chip(diet, state.diets, function () {
        save("diets", Array.from(state.diets));
        renderMenu();
      }));
    });
    el.favChips.textContent = "";
    var favSet = {
      has: function () { return state.favOnly; },
      add: function () { state.favOnly = true; },
      delete: function () { state.favOnly = false; }
    };
    el.favChips.appendChild(chip("\u2605 Favorites only", favSet, renderMenu));

    el.allergenChips.textContent = "";
    ALLERGENS.forEach(function (allergen) {
      el.allergenChips.appendChild(chip(allergen, state.hidden, function () {
        save("hidden", Array.from(state.hidden));
        updateAllergenBadge();
        renderMenu();
      }));
    });
    updateAllergenBadge();
  }

  function chip(label, set, onToggle) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = label;
    button.setAttribute("aria-pressed", String(set.has(label)));
    button.addEventListener("click", function () {
      if (set.has(label)) set.delete(label); else set.add(label);
      button.setAttribute("aria-pressed", String(set.has(label)));
      onToggle();
    });
    return button;
  }

  function updateAllergenBadge() {
    el.allergenCount.hidden = state.hidden.size === 0;
    el.allergenCount.textContent = String(state.hidden.size);
  }

  function matches(item) {
    if (state.favOnly && !state.favs.has(item.name)) return false;
    var needle = state.search.trim().toLowerCase();
    if (needle) {
      var hay = (item.name + " " + (item.station || "") + " " + (item.description || "")).toLowerCase();
      if (hay.indexOf(needle) === -1) return false;
    }
    var tags = item.tags || [];
    var wanted = Array.from(state.diets);
    for (var i = 0; i < wanted.length; i++) {
      if (tags.indexOf(wanted[i]) === -1) return false;
    }
    var allergens = item.allergens || [];
    for (var j = 0; j < allergens.length; j++) {
      if (state.hidden.has(allergens[j])) return false;
    }
    return true;
  }

  function renderMenu() {
    el.menu.textContent = "";
    if (!state.day) return;
    var items = (state.day.meals[state.meal] || []).filter(matches);

    renderFavNote(state.day.meals[state.meal] || []);

    if (!items.length) {
      var empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = (state.day.meals[state.meal] || []).length
        ? "Nothing on this menu matches your filters."
        : "No " + (MEAL_LABELS[state.meal] || state.meal).toLowerCase() + " menu posted for " + prettyDate(state.date) + ".";
      el.menu.appendChild(empty);
      return;
    }

    var order = [];
    var groups = {};
    items.forEach(function (item) {
      var station = item.station || "Menu";
      if (!groups[station]) { groups[station] = []; order.push(station); }
      groups[station].push(item);
    });

    order.forEach(function (station) {
      var section = document.createElement("section");
      section.className = "station";
      var heading = document.createElement("h2");
      heading.textContent = station + " · " + groups[station].length;
      section.appendChild(heading);
      var list = document.createElement("div");
      list.className = "items";
      groups[station].forEach(function (item) { list.appendChild(itemCard(item)); });
      section.appendChild(list);
      el.menu.appendChild(section);
    });
  }

  function renderFavNote(mealItems) {
    var hits = mealItems.filter(function (item) { return state.favs.has(item.name); });
    el.favNote.hidden = hits.length === 0;
    if (hits.length) {
      el.favNote.textContent = "⭐ On this menu: " + hits.slice(0, 4).map(function (i) { return i.name; }).join(", ") +
        (hits.length > 4 ? " and " + (hits.length - 4) + " more" : "") + ".";
    }
  }

  function itemCard(item) {
    var card = document.createElement("article");
    card.className = "item";

    var head = document.createElement("button");
    head.type = "button";
    head.className = "item-head";
    head.setAttribute("aria-expanded", String(state.open.has(item.id)));

    var body = document.createElement("div");
    body.className = "item-body";
    var name = document.createElement("div");
    name.className = "item-name";
    name.textContent = item.name;
    body.appendChild(name);

    var meta = document.createElement("div");
    meta.className = "item-meta";
    if (item.calories != null) meta.appendChild(span("", item.calories + " cal"));
    if (item.protein != null) meta.appendChild(span("", item.protein + "g protein"));
    (item.tags || []).forEach(function (tag) { meta.appendChild(span("tag", tag)); });
    (item.allergens || []).forEach(function (a) { meta.appendChild(span("allergy", a)); });
    body.appendChild(meta);
    head.appendChild(body);

    var star = document.createElement("button");
    star.type = "button";
    star.className = "star";
    star.title = "Save as a favorite";
    star.setAttribute("aria-label", "Favorite " + item.name);
    star.setAttribute("aria-pressed", String(state.favs.has(item.name)));
    star.textContent = state.favs.has(item.name) ? "★" : "☆";
    star.addEventListener("click", function (event) {
      event.stopPropagation();
      if (state.favs.has(item.name)) state.favs.delete(item.name); else state.favs.add(item.name);
      star.setAttribute("aria-pressed", String(state.favs.has(item.name)));
      star.textContent = state.favs.has(item.name) ? "★" : "☆";
      save("favs", Array.from(state.favs));
      if (state.favOnly) renderMenu(); else renderFavNote(state.day.meals[state.meal] || []);
    });

    var row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "flex-start";
    row.appendChild(head);
    row.appendChild(star);
    card.appendChild(row);

    var detail = document.createElement("div");
    detail.className = "detail";
    detail.hidden = !state.open.has(item.id);
    detail.appendChild(detailContent(item));
    card.appendChild(detail);

    head.addEventListener("click", function () {
      var nowOpen = detail.hidden;
      detail.hidden = !nowOpen;
      head.setAttribute("aria-expanded", String(nowOpen));
      if (nowOpen) state.open.add(item.id); else state.open.delete(item.id);
    });

    return card;
  }

  function detailContent(item) {
    var wrap = document.createDocumentFragment();
    if (item.description) {
      var p = document.createElement("p");
      p.textContent = item.description;
      wrap.appendChild(p);
    }
    if (item.serving) {
      var serving = document.createElement("p");
      serving.textContent = "Serving size: " + item.serving;
      wrap.appendChild(serving);
    }
    var facts = [
      ["Calories", item.calories, ""], ["Protein", item.protein, "g"], ["Carbs", item.carbs, "g"],
      ["Fat", item.fat, "g"], ["Fiber", item.fiber, "g"], ["Sugar", item.sugar, "g"], ["Sodium", item.sodium, "mg"]
    ].filter(function (fact) { return fact[1] != null; });
    if (facts.length) {
      var grid = document.createElement("div");
      grid.className = "nutrition";
      facts.forEach(function (fact) {
        var cell = document.createElement("div");
        cell.innerHTML = "<span></span><strong></strong>";
        cell.firstChild.textContent = fact[0];
        cell.lastChild.textContent = fact[1] + fact[2];
        grid.appendChild(cell);
      });
      wrap.appendChild(grid);
    } else {
      var none = document.createElement("p");
      none.textContent = "No nutrition information posted for this item.";
      wrap.appendChild(none);
    }
    return wrap;
  }

  function span(cls, text) {
    var s = document.createElement("span");
    if (cls) s.className = cls;
    s.textContent = text;
    return s;
  }

  function renderStatus() {
    var hours = (state.index.location || {}).hours || {};
    var now = centralParts();
    var today = hours[now.weekday];
    el.status.hidden = false;
    if (!today) {
      el.statusDot.className = "dot closed";
      el.statusText.textContent = "Closed today";
      return;
    }
    if (today === "24 hours") {
      el.statusDot.className = "dot open";
      el.statusText.textContent = "Open 24 hours";
      return;
    }
    var bits = today.split("-");
    var start = toMinutes(bits[0]);
    var end = toMinutes(bits[1]);
    var isOpen = now.minutes >= start && now.minutes < end;
    el.statusDot.className = "dot " + (isOpen ? "open" : "closed");
    el.statusText.textContent = (isOpen ? "Open until " + to12h(bits[1]) : "Closed · today " + to12h(bits[0]) + "–" + to12h(bits[1]));
  }

  function toMinutes(hhmm) {
    var bits = hhmm.split(":").map(Number);
    return bits[0] * 60 + bits[1];
  }

  function selectDate(date) {
    state.date = date;
    state.open.clear();
    renderDays();
    el.menu.innerHTML = '<p class="loading">Loading menu…</p>';
    loadDay(date).then(function (result) {
      if (state.date !== date) return;
      state.day = result.day;
      var available = Object.keys(result.day.meals);
      if (available.indexOf(state.meal) === -1) {
        state.meal = available.indexOf(mealForNow(centralParts().minutes)) !== -1
          ? mealForNow(centralParts().minutes)
          : available[0];
      }
      showNotice(result.cached ? "Offline — showing the copy saved on this device." : "");
      renderMeals();
      renderMenu();
    }).catch(function () {
      if (state.date !== date) return;
      state.day = null;
      renderMeals();
      el.menu.innerHTML = '<p class="empty">No menu is posted for ' + prettyDate(date) + " yet.</p>";
      el.favNote.hidden = true;
    });
  }

  function showNotice(text) {
    el.notice.hidden = !text;
    el.notice.textContent = text;
  }

  function pickInitialDate(index) {
    var today = centralParts().date;
    if (index.dates.indexOf(today) !== -1) return today;
    var next = index.dates.filter(function (d) { return d >= today; })[0];
    return next || index.dates[index.dates.length - 1];
  }

  function wireControls() {
    var timer;
    el.search.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.search = el.search.value;
        renderMenu();
      }, 120);
    });
    el.todayJump.addEventListener("click", function () {
      var today = centralParts().date;
      if (state.index.dates.indexOf(today) !== -1) selectDate(today);
    });
    el.prevDay.addEventListener("click", function () { step(-1); });
    el.nextDay.addEventListener("click", function () { step(1); });
    document.addEventListener("keydown", function (event) {
      if (event.target === el.search || event.metaKey || event.ctrlKey) return;
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    });
  }

  function step(delta) {
    var dates = state.index.dates;
    var index = dates.indexOf(state.date) + delta;
    if (index >= 0 && index < dates.length) selectDate(dates[index]);
  }

  function boot() {
    state.diets = new Set(load("diets", []));
    state.hidden = new Set(load("hidden", []));
    fetchJSON("index.json").then(function (index) {
      state.index = index;
      state.meal = mealForNow(centralParts().minutes);
      state.date = pickInitialDate(index);
      renderChips();
      renderStatus();
      wireControls();
      el.updated.textContent = "Menu data pulled " + new Date(index.generated_at).toLocaleString() + ".";
      selectDate(state.date);
    }).catch(function (err) {
      el.menu.innerHTML = '<p class="empty">Could not load the menu data (' + err.message + ").</p>";
    });
  }

  boot();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {
        /* offline support is a bonus; the page works without it */
      });
    });
  }
})();
