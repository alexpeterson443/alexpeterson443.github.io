/* Sandburg Café menu — reads the JSON in /data that CI refreshes every morning. */
(function () {
  "use strict";

  var DATA_URL = new URL("../data/", location.href);
  var TZ = "America/Chicago";
  var MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snacks: "Snacks" };
  var DIETS = ["Vegetarian", "Vegan"];
  var ALLERGENS = ["Milk", "Eggs", "Wheat", "Gluten", "Soy", "Peanuts", "Tree Nuts", "Fish", "Shellfish", "Sesame"];
  var FAV_LABEL = "Favorites";
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>';

  var el = {};
  ["days", "meals", "menu", "search", "clearSearch", "dietChips", "allergenChips", "stationList",
   "stationBar", "rail", "filterToggle", "filterCount", "resetFilters", "prevDay", "nextDay",
   "todayJump", "dayTitle", "notice", "favNote", "summary", "updated", "status", "statusDot",
   "statusText"].forEach(function (id) { el[id] = document.getElementById(id); });

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
    open: new Set(),
    sections: [],
    spy: null
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
      /* private mode or a full quota — preferences just don't persist */
    }
  }

  /* ---- the café's clock, not the visitor's ---- */

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

  function asDate(iso) {
    var parts = iso.split("-").map(Number);
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  }

  function prettyDate(iso) {
    return asDate(iso).toLocaleDateString(undefined, {
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

  /* ---- small builders ---- */

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function chip(label, isPressed, onToggle, extraClass) {
    var button = make("button", "chip" + (extraClass ? " " + extraClass : ""), label);
    button.type = "button";
    button.setAttribute("aria-pressed", String(isPressed()));
    button.addEventListener("click", function () {
      onToggle();
      button.setAttribute("aria-pressed", String(isPressed()));
      updateFilterCount();
      renderMenu();
    });
    return button;
  }

  function setChip(set, label) {
    return {
      pressed: function () { return set.has(label); },
      toggle: function () {
        if (set.has(label)) set.delete(label); else set.add(label);
        save(set === state.diets ? "diets" : "hidden", Array.from(set));
      }
    };
  }

  /* ---- filters ---- */

  function renderFilters() {
    el.dietChips.textContent = "";
    DIETS.forEach(function (diet) {
      var handle = setChip(state.diets, diet);
      el.dietChips.appendChild(chip(diet, handle.pressed, handle.toggle));
    });
    el.dietChips.appendChild(chip("★ " + FAV_LABEL,
      function () { return state.favOnly; },
      function () { state.favOnly = !state.favOnly; }));

    el.allergenChips.textContent = "";
    ALLERGENS.forEach(function (allergen) {
      var handle = setChip(state.hidden, allergen);
      el.allergenChips.appendChild(chip(allergen, handle.pressed, handle.toggle, "is-hide"));
    });

    updateFilterCount();
  }

  function activeFilterCount() {
    return state.diets.size + state.hidden.size + (state.favOnly ? 1 : 0);
  }

  function updateFilterCount() {
    var count = activeFilterCount();
    el.filterCount.hidden = count === 0;
    el.filterCount.textContent = String(count);
  }

  function resetFilters() {
    state.diets.clear();
    state.hidden.clear();
    state.favOnly = false;
    state.search = "";
    el.search.value = "";
    el.clearSearch.hidden = true;
    save("diets", []);
    save("hidden", []);
    renderFilters();
    renderMenu();
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

  /* ---- days and meals ---- */

  function renderDays() {
    var today = centralParts().date;
    var dates = state.index.dates;
    el.days.textContent = "";

    dates.forEach(function (date) {
      var isToday = date === today;
      var button = make("button", "day" + (isToday ? " today" : ""));
      button.type = "button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(date === state.date));
      button.appendChild(make("span", "dow", isToday ? "Today"
        : asDate(date).toLocaleDateString(undefined, { timeZone: "UTC", weekday: "short" })));
      button.appendChild(make("span", "dnum", String(asDate(date).getUTCDate())));
      button.addEventListener("click", function () { selectDate(date); });
      el.days.appendChild(button);
    });

    var selected = el.days.querySelector('[aria-selected="true"]');
    if (selected) selected.scrollIntoView({ block: "nearest", inline: "center" });

    el.dayTitle.textContent = state.date === today ? "Today" : prettyDate(state.date);
    el.todayJump.hidden = state.date === today || dates.indexOf(today) === -1;
    el.prevDay.disabled = dates.indexOf(state.date) <= 0;
    el.nextDay.disabled = dates.indexOf(state.date) === dates.length - 1;
  }

  function renderMeals() {
    var available = state.day ? Object.keys(state.day.meals) : [];
    el.meals.textContent = "";
    state.index.meals.forEach(function (meal) {
      var button = make("button", "seg", MEAL_LABELS[meal] || meal);
      button.type = "button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(meal === state.meal));
      button.disabled = available.indexOf(meal) === -1;
      button.addEventListener("click", function () {
        state.meal = meal;
        state.open.clear();
        renderMeals();
        renderMenu();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      el.meals.appendChild(button);
    });
  }

  /* ---- menu ---- */

  function groupByStation(items) {
    var order = [];
    var groups = {};
    items.forEach(function (item) {
      var station = item.station || "Menu";
      if (!groups[station]) { groups[station] = []; order.push(station); }
      groups[station].push(item);
    });
    return order.map(function (station) { return { name: station, items: groups[station] }; });
  }

  function renderMenu() {
    var all = (state.day && state.day.meals[state.meal]) || [];
    var items = all.filter(matches);

    renderFavNote(all);
    renderSummary(all, items);

    el.menu.textContent = "";
    if (state.spy) { state.spy.disconnect(); state.spy = null; }
    state.sections = [];

    if (!items.length) {
      el.stationList.textContent = "";
      el.stationBar.textContent = "";
      el.menu.appendChild(emptyState(all.length));
      return;
    }

    var groups = groupByStation(items);
    groups.forEach(function (group, index) {
      var section = make("section", "station-section");
      section.id = "station-" + index;

      var head = make("div", "station-head");
      head.appendChild(make("h2", null, group.name));
      head.appendChild(make("span", "n", String(group.items.length)));
      head.appendChild(make("span", "rule"));
      section.appendChild(head);

      var list = make("div", "dishes");
      group.items.forEach(function (item) { list.appendChild(dishCard(item)); });
      section.appendChild(list);

      el.menu.appendChild(section);
      state.sections.push(section);
    });

    renderStationNav(groups);
    watchSections();
  }

  function emptyState(totalInMeal) {
    var wrap = make("div", "empty");
    if (totalInMeal) {
      wrap.appendChild(make("strong", null, "Nothing matches"));
      wrap.appendChild(make("p", null, "Try clearing a filter or searching for something else."));
      var reset = make("button", "pill-btn", "Clear all filters");
      reset.type = "button";
      reset.addEventListener("click", resetFilters);
      wrap.appendChild(reset);
    } else {
      wrap.appendChild(make("strong", null, "No menu posted"));
      wrap.appendChild(make("p", null,
        "UWM hasn't published " + (MEAL_LABELS[state.meal] || state.meal).toLowerCase() +
        " for " + prettyDate(state.date) + " yet."));
    }
    return wrap;
  }

  function renderSummary(all, shown) {
    if (!all.length) { el.summary.textContent = ""; return; }
    var vegan = all.filter(function (i) { return (i.tags || []).indexOf("Vegan") !== -1; }).length;
    var parts = [];
    parts.push(shown.length === all.length
      ? all.length + " items"
      : shown.length + " of " + all.length + " items");
    parts.push(groupByStation(all).length + " stations");
    if (vegan) parts.push(vegan + " vegan");
    el.summary.textContent = parts.join(" · ");
  }

  function renderFavNote(mealItems) {
    var hits = mealItems.filter(function (item) { return state.favs.has(item.name); });
    el.favNote.hidden = hits.length === 0 || state.favOnly;
    if (!el.favNote.hidden) {
      el.favNote.textContent = "★ On this menu: " +
        hits.slice(0, 4).map(function (i) { return i.name; }).join(", ") +
        (hits.length > 4 ? " and " + (hits.length - 4) + " more" : "");
    }
  }

  function renderStationNav(groups) {
    [el.stationList, el.stationBar].forEach(function (container) {
      container.textContent = "";
      groups.forEach(function (group, index) {
        var link = make("button", "station-link");
        link.type = "button";
        link.dataset.index = String(index);
        link.appendChild(make("span", "label", group.name));
        link.appendChild(make("span", "n", String(group.items.length)));
        link.addEventListener("click", function () {
          var section = state.sections[index];
          if (section) section.scrollIntoView({ block: "start" });
        });
        container.appendChild(link);
      });
    });
  }

  function markActiveStation(index) {
    [el.stationList, el.stationBar].forEach(function (container) {
      Array.prototype.forEach.call(container.children, function (link, i) {
        var active = i === index;
        link.classList.toggle("is-active", active);
        if (active && container === el.stationBar) {
          link.scrollIntoView({ block: "nearest", inline: "center" });
        }
      });
    });
  }

  function watchSections() {
    if (!("IntersectionObserver" in window) || !state.sections.length) return;
    var visible = {};
    state.spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      for (var i = 0; i < state.sections.length; i++) {
        if (visible[state.sections[i].id]) { markActiveStation(i); return; }
      }
    }, { rootMargin: "-30% 0px -60% 0px" });
    state.sections.forEach(function (section) { state.spy.observe(section); });
    markActiveStation(0);
  }

  /* ---- one dish ---- */

  function dishCard(item) {
    var card = make("article", "dish" + (state.favs.has(item.name) ? " is-fav" : ""));

    var main = make("button", "dish-main");
    main.type = "button";
    main.setAttribute("aria-expanded", String(state.open.has(item.id)));

    var top = make("div", "dish-top");
    top.appendChild(make("h3", "dish-name", item.name));
    if (item.calories != null) {
      var kcal = make("span", "kcal", String(item.calories));
      kcal.appendChild(make("small", null, "cal"));
      top.appendChild(kcal);
    }
    main.appendChild(top);

    if (item.description) main.appendChild(make("p", "dish-desc", item.description));

    var tags = make("div", "dish-tags");
    (item.tags || []).forEach(function (tag) { tags.appendChild(make("span", "pill diet", tag)); });
    if (item.protein != null) tags.appendChild(make("span", "pill macro", item.protein + "g protein"));
    (item.allergens || []).forEach(function (a) { tags.appendChild(make("span", "pill allergen", a)); });
    if (tags.children.length) main.appendChild(tags);

    card.appendChild(main);

    var fav = make("button", "fav");
    fav.type = "button";
    fav.innerHTML = STAR;
    fav.title = "Save as a favorite";
    fav.setAttribute("aria-label", "Favorite " + item.name);
    fav.setAttribute("aria-pressed", String(state.favs.has(item.name)));
    fav.addEventListener("click", function (event) {
      event.stopPropagation();
      if (state.favs.has(item.name)) state.favs.delete(item.name); else state.favs.add(item.name);
      save("favs", Array.from(state.favs));
      fav.setAttribute("aria-pressed", String(state.favs.has(item.name)));
      card.classList.toggle("is-fav", state.favs.has(item.name));
      if (state.favOnly) renderMenu();
      else renderFavNote((state.day && state.day.meals[state.meal]) || []);
    });
    card.appendChild(fav);

    var detail = make("div", "dish-detail");
    detail.hidden = !state.open.has(item.id);
    detail.appendChild(detailContent(item));
    card.appendChild(detail);
    card.classList.toggle("is-open", !detail.hidden);

    main.addEventListener("click", function () {
      var nowOpen = detail.hidden;
      detail.hidden = !nowOpen;
      card.classList.toggle("is-open", nowOpen);
      main.setAttribute("aria-expanded", String(nowOpen));
      if (nowOpen) state.open.add(item.id); else state.open.delete(item.id);
    });

    return card;
  }

  function detailContent(item) {
    var wrap = document.createDocumentFragment();

    if (item.serving) wrap.appendChild(make("p", "serving", "Serving size: " + item.serving));

    var p = item.protein, c = item.carbs, f = item.fat;
    if (p != null && c != null && f != null && (p + c + f) > 0) {
      var cals = [p * 4, c * 4, f * 9];
      var total = cals[0] + cals[1] + cals[2];
      var bar = make("div", "macrobar");
      ["p", "c", "f"].forEach(function (key, i) {
        var seg = make("span", key);
        seg.style.width = (cals[i] / total * 100).toFixed(1) + "%";
        bar.appendChild(seg);
      });
      bar.title = "Protein " + p + "g · Carbs " + c + "g · Fat " + f + "g";
      wrap.appendChild(bar);
    }

    var facts = [
      ["Calories", item.calories, ""], ["Protein", item.protein, "g"], ["Carbs", item.carbs, "g"],
      ["Fat", item.fat, "g"], ["Fiber", item.fiber, "g"], ["Sugar", item.sugar, "g"],
      ["Sodium", item.sodium, "mg"]
    ].filter(function (fact) { return fact[1] != null; });

    if (facts.length) {
      var grid = make("div", "nutrition");
      facts.forEach(function (fact) {
        var cell = make("div");
        cell.appendChild(make("span", null, fact[0]));
        cell.appendChild(make("strong", null, fact[1] + fact[2]));
        grid.appendChild(cell);
      });
      wrap.appendChild(grid);
    } else {
      wrap.appendChild(make("p", "serving", "No nutrition information posted for this item."));
    }

    return wrap;
  }

  /* ---- hours ---- */

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
    var open = now.minutes >= toMinutes(bits[0]) && now.minutes < toMinutes(bits[1]);
    el.statusDot.className = "dot " + (open ? "open" : "closed");
    el.statusText.textContent = open
      ? "Open until " + to12h(bits[1])
      : "Closed · " + to12h(bits[0]) + "–" + to12h(bits[1]);
  }

  function toMinutes(hhmm) {
    var bits = hhmm.split(":").map(Number);
    return bits[0] * 60 + bits[1];
  }

  /* ---- flow ---- */

  function showSkeleton() {
    el.menu.textContent = "";
    el.summary.textContent = "";
    var skeleton = make("div", "skeleton");
    for (var i = 0; i < 6; i++) skeleton.appendChild(make("div"));
    el.menu.appendChild(skeleton);
  }

  function selectDate(date) {
    state.date = date;
    state.open.clear();
    renderDays();
    showSkeleton();

    loadDay(date).then(function (result) {
      if (state.date !== date) return;
      state.day = result.day;
      var available = Object.keys(result.day.meals);
      if (available.indexOf(state.meal) === -1) {
        var now = mealForNow(centralParts().minutes);
        state.meal = available.indexOf(now) !== -1 ? now : available[0];
      }
      showNotice(result.cached ? "Offline — showing the copy saved on this device." : "");
      renderMeals();
      renderMenu();
    }).catch(function () {
      if (state.date !== date) return;
      state.day = null;
      renderMeals();
      renderMenu();
    });
  }

  function showNotice(text) {
    el.notice.hidden = !text;
    el.notice.textContent = text;
  }

  function step(delta) {
    var dates = state.index.dates;
    var next = dates.indexOf(state.date) + delta;
    if (next >= 0 && next < dates.length) selectDate(dates[next]);
  }

  function pickInitialDate(index) {
    var today = centralParts().date;
    if (index.dates.indexOf(today) !== -1) return today;
    return index.dates.filter(function (d) { return d >= today; })[0] || index.dates[index.dates.length - 1];
  }

  function wireControls() {
    var timer;
    el.search.addEventListener("input", function () {
      el.clearSearch.hidden = !el.search.value;
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.search = el.search.value;
        renderMenu();
      }, 110);
    });

    el.clearSearch.addEventListener("click", function () {
      el.search.value = "";
      el.clearSearch.hidden = true;
      state.search = "";
      renderMenu();
      el.search.focus();
    });

    el.filterToggle.addEventListener("click", function () {
      var open = el.rail.classList.toggle("is-open");
      el.filterToggle.setAttribute("aria-expanded", String(open));
    });

    el.resetFilters.addEventListener("click", resetFilters);
    el.prevDay.addEventListener("click", function () { step(-1); });
    el.nextDay.addEventListener("click", function () { step(1); });

    el.todayJump.addEventListener("click", function () {
      var today = centralParts().date;
      if (state.index.dates.indexOf(today) !== -1) selectDate(today);
    });

    document.addEventListener("keydown", function (event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      var typing = event.target === el.search;
      if (event.key === "/" && !typing) { event.preventDefault(); el.search.focus(); return; }
      if (event.key === "Escape" && typing) { el.search.blur(); return; }
      if (typing) return;
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    });
  }

  function boot() {
    state.diets = new Set(load("diets", []));
    state.hidden = new Set(load("hidden", []));
    showSkeleton();

    fetchJSON("index.json").then(function (index) {
      state.index = index;
      state.meal = mealForNow(centralParts().minutes);
      state.date = pickInitialDate(index);
      renderFilters();
      renderStatus();
      wireControls();
      el.updated.textContent = "Menu data pulled " + new Date(index.generated_at).toLocaleString() + ".";
      selectDate(state.date);
    }).catch(function (err) {
      el.menu.textContent = "";
      var wrap = make("div", "empty");
      wrap.appendChild(make("strong", null, "Couldn't load the menu"));
      wrap.appendChild(make("p", null, err.message));
      el.menu.appendChild(wrap);
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
