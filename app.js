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
  const countryStampCode = (country) => {
    if (!country) return '';
    const c = country.toLowerCase();
    if (c.includes('usa')) return 'USA';
    if (c.includes('morocco')) return 'MAR';
    if (c.includes('spain') || c.includes('balearic')) return 'ESP';
    if (c.includes('portugal')) return 'PRT';
    if (c.includes('italy')) return 'ITA';
    if (c.includes('france')) return 'FRA';
    if (c.includes('mediterranean')) return 'SEA';
    if (c.includes('→')) {
      // travel day — first country
      const first = country.split('→')[0].trim().toLowerCase();
      if (first.includes('🇲🇦') || first.includes('morocco')) return 'MAR';
      if (first.includes('🇺🇸') || first.includes('usa')) return 'USA';
      return '✈';
    }
    return '';
  };

  function renderDays() {
    const grid = $('#daysGrid');
    if (!grid || !T.days) return;
    grid.innerHTML = T.days.map((day, i) => {
      const hasPhoto = day.photos && day.photos.length > 0;
      const cover = hasPhoto
        ? (typeof day.photos[0] === 'string' ? day.photos[0] : day.photos[0].src)
        : null;
      const photoBlock = cover
        ? `<div class="dayPhoto dayPhoto--cover"><img src="${cover}" alt="" /></div>`
        : `<div class="dayPhoto"><div class="placeholder">
             <div class="icon">${day.coverIcon || day.flag || '✦'}</div>
             <div>${day.coverLabel || 'photo soon'}</div>
           </div></div>`;
      const stampCode = countryStampCode(day.country);
      const stampBlock = stampCode
        ? `<div class="countryStamp">${stampCode}<br><span style="font-size:8px;letter-spacing:1px;opacity:0.8;">2026</span></div>`
        : '';
      const stickerNum = i === 0 ? 'no. 00' : `no. ${String(i).padStart(2, '0')}`;
      return `
        <a class="dayCard" href="day.html?id=${day.id}">
          <div class="pageSticker">${stickerNum}</div>
          ${photoBlock}
          <div class="dayLabel">${day.label}</div>
          <div class="dayCity">${day.city}</div>
          <div class="dayKicker">${day.kicker || ''}</div>
          <div class="dayCaption">${day.summary || ''}</div>
          ${stampBlock}
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
