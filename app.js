// ============================================================
// SHAFFER EUROPE 2026 — render + countdown
// ============================================================

(function () {
  const T = window.TRIP;
  if (!T) return;

  // ---------- helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const ymd = (s) => {
    // Treat ISO date string as local midnight to avoid TZ drift
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const today = () => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  };
  const daysBetween = (a, b) => Math.round((b - a) / (1000 * 60 * 60 * 24));

  // ---------- countdown / day-counter ----------
  function renderCountdown() {
    const labelEl = $('#countdownLabel');
    const numEl = $('#countdownNumber');
    const unitEl = $('#countdownUnit');
    const subEl = $('#countdownSub');
    if (!numEl) return;

    const start = ymd(T.meta.departDate);
    const end = ymd(T.meta.returnDate);
    const now = today();

    if (now < start) {
      const d = daysBetween(now, start);
      labelEl.textContent = 'Until we leave';
      numEl.textContent = d;
      unitEl.textContent = d === 1 ? 'day' : 'days';
      subEl.textContent = T.meta.tagline;
    } else if (now >= start && now <= end) {
      const tripDay = daysBetween(start, now) + 1;
      const total = daysBetween(start, end) + 1;
      labelEl.textContent = 'Trip day';
      numEl.textContent = tripDay;
      unitEl.textContent = `of ${total}`;
      subEl.textContent = T.whereNow ? T.whereNow.city : '';
    } else {
      const d = daysBetween(end, now);
      labelEl.textContent = 'Home again';
      numEl.textContent = d;
      unitEl.textContent = d === 1 ? 'day ago' : 'days ago';
      subEl.textContent = 'A trip well taken.';
    }
  }

  // ---------- where they are now ----------
  function renderWhereNow() {
    const w = T.whereNow || {};
    const city = $('#whereCity');
    const note = $('#whereNote');
    if (city) city.textContent = w.city || '—';
    if (note) note.textContent = w.note || '';
  }

  // ---------- cities strip ----------
  function renderCities() {
    const strip = $('#citiesStrip');
    if (!strip || !T.cities) return;
    strip.innerHTML = T.cities.map(c =>
      `<span class="city">${c.flag || ''} ${c.name}</span>`
    ).join('');
  }

  // ---------- day cards ----------
  function renderDays() {
    const grid = $('#daysGrid');
    if (!grid || !T.days) return;
    grid.innerHTML = T.days.map(day => {
      const hasPhoto = day.photos && day.photos.length > 0;
      const cover = hasPhoto ? day.photos[0] : null;
      const photoBlock = cover
        ? `<div class="dayPhoto" style="padding-top:0;background:#fff;"><img src="${cover}" alt="" style="width:100%;display:block;" /></div>`
        : `<div class="dayPhoto"><div class="placeholder">
             <div class="icon">${day.flag || '✦'}</div>
             <div>photo soon</div>
           </div></div>`;
      return `
        <a class="dayCard" href="day.html?id=${day.id}">
          ${photoBlock}
          <div class="dayLabel">${day.label}</div>
          <div class="dayCity">${day.city}</div>
          <div class="dayKicker">${day.kicker || ''}</div>
          <div class="dayCaption">${day.summary || ''}</div>
        </a>
      `;
    }).join('');
  }

  // ---------- init ----------
  document.addEventListener('DOMContentLoaded', () => {
    renderCountdown();
    renderWhereNow();
    renderCities();
    renderDays();
  });
})();
