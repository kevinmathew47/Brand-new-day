/* ============================================================
   BRAND NEW DAY — schedule page
   Day tabs, type filters, live "now" marker, per-item calendar
   ============================================================ */
(function () {
  'use strict';

  var TYPE_LABEL = {
    session: 'Session',
    worship: 'Worship',
    meal: 'Meal',
    fun: 'Fun',
    logistics: 'Logistics'
  };

  var tabs, panels, activeDay = 0, activeFilter = 'all';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* Turn a day's [y, m, d] + item [h, m] into a real Date */
  function at(day, hm) {
    return new Date(day.ymd[0], day.ymd[1], day.ymd[2], hm[0], hm[1], 0);
  }

  /* ---------- Build ------------------------------------------- */
  function build() {
    var tabWrap = document.getElementById('day-tabs');
    var panelWrap = document.getElementById('day-panels');
    if (!tabWrap || !panelWrap || !window.SCHEDULE) return;

    tabWrap.innerHTML = window.SCHEDULE.map(function (d, i) {
      return '<button class="day-tab" role="tab" data-day="' + i + '" aria-selected="false">' +
               '<span class="day-tab__day">' + esc(d.day) + '</span>' +
               '<span class="day-tab__date">' + esc(d.date) + ' &middot; ' + esc(d.label) + '</span>' +
             '</button>';
    }).join('');

    panelWrap.innerHTML = window.SCHEDULE.map(function (d, i) {
      var items = d.items.map(function (it, j) {
        var meta = it.speaker
          ? '<div class="tl-item__meta">' + esc(it.speaker) + '</div>'
          : (it.meta ? '<div class="tl-item__meta">' + esc(it.meta) + '</div>' : '');

        return '<article class="tl-item" data-type="' + it.type + '" data-day="' + i + '" data-idx="' + j + '">' +
                 '<div class="tl-item__time">' + esc(it.time) + '</div>' +
                 '<div>' +
                   '<div class="tl-item__title">' + esc(it.title) + '</div>' +
                   meta +
                   '<span class="tl-item__tag">' + (TYPE_LABEL[it.type] || it.type) + '</span>' +
                 '</div>' +
               '</article>';
      }).join('');

      return '<div class="day-panel" data-day="' + i + '" role="tabpanel">' +
               '<div class="timeline">' + items + '</div>' +
             '</div>';
    }).join('');

    tabs = Array.prototype.slice.call(tabWrap.querySelectorAll('.day-tab'));
    panels = Array.prototype.slice.call(panelWrap.querySelectorAll('.day-panel'));

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { showDay(+t.dataset.day); });
    });

    document.querySelectorAll('#filters .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('#filters .chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        activeFilter = chip.dataset.filter;
        applyFilter();
      });
    });

    /* Clicking an item offers it as a calendar entry */
    panelWrap.addEventListener('click', function (e) {
      var el = e.target.closest('.tl-item');
      if (!el) return;
      var day = window.SCHEDULE[+el.dataset.day];
      var it = day.items[+el.dataset.idx];
      if (!it.s) return;
      var start = at(day, it.s);
      var end = it.e ? at(day, it.e) : new Date(start.getTime() + 45 * 60000);
      window.downloadICS(
        it.title,
        start, end,
        (it.speaker || it.meta || '') + ' — Brand New Day, Youth Camp 2026',
        'bnd-' + it.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      );
    });
  }

  /* ---------- Day switching ----------------------------------- */
  function showDay(i) {
    activeDay = i;
    tabs.forEach(function (t, k) {
      t.classList.toggle('is-active', k === i);
      t.setAttribute('aria-selected', String(k === i));
    });
    panels.forEach(function (p, k) { p.classList.toggle('is-active', k === i); });
    applyFilter();
  }

  function applyFilter() {
    var panel = panels[activeDay];
    if (!panel) return;
    var shown = 0;
    panel.querySelectorAll('.tl-item').forEach(function (el) {
      var ok = activeFilter === 'all' || el.dataset.type === activeFilter;
      el.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });

    var empty = panel.querySelector('.no-results');
    if (!shown) {
      if (!empty) {
        empty = document.createElement('p');
        empty.className = 'no-results';
        panel.appendChild(empty);
      }
      empty.textContent = 'Nothing of that kind on this day';
    } else if (empty) {
      empty.remove();
    }
  }

  /* ---------- Live "now" marker -------------------------------- */
  function markNow() {
    var now = Date.now();
    var current = null;

    window.SCHEDULE.forEach(function (d, i) {
      d.items.forEach(function (it, j) {
        if (!it.s) return;
        var start = at(d, it.s).getTime();
        var end = (it.e ? at(d, it.e) : new Date(start + 45 * 60000)).getTime();
        var el = document.querySelector('.tl-item[data-day="' + i + '"][data-idx="' + j + '"]');
        if (!el) return;

        el.classList.remove('is-now', 'is-past');
        if (now >= start && now < end) {
          el.classList.add('is-now');
          current = { day: i, el: el };
        } else if (now >= end) {
          el.classList.add('is-past');
        }
      });
    });
    return current;
  }

  /* Open the most relevant day: the live one, else the first upcoming, else day 1 */
  function pickInitialDay() {
    var now = Date.now();
    for (var i = 0; i < window.SCHEDULE.length; i++) {
      var d = window.SCHEDULE[i];
      var last = d.items[d.items.length - 1];
      var endOfDay = at(d, last.e || last.s).getTime() + 60 * 60000;
      if (now < endOfDay) return i;
    }
    return 0;
  }

  window.initPage = function () {
    build();
    if (!tabs) return;

    showDay(pickInitialDay());
    var live = markNow();
    setInterval(markNow, 30000);

    /* Speakers */
    window.renderSpeakers(document.getElementById('speaker-grid'));

    /* Jump to now */
    var jump = document.getElementById('jump-now');
    if (jump) {
      jump.addEventListener('click', function () {
        var cur = markNow();
        if (cur) {
          showDay(cur.day);
          cur.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          var start = window.CAMP.start.getTime();
          window.toast(Date.now() < start ? 'Camp hasn’t started yet' : 'Camp is over — till we meet again');
        }
      });
    }

    /* Whole-camp calendar */
    var cal = document.getElementById('add-cal');
    if (cal) {
      cal.addEventListener('click', function () {
        window.downloadICS(
          'Brand New Day — Youth Camp 2026',
          window.CAMP.start, window.CAMP.end,
          window.CAMP.org + ' — ' + window.CAMP.venue,
          'brand-new-day-2026'
        );
      });
    }
  };
})();
