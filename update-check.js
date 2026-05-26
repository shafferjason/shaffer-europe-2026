// ============================================================
// SHAFFERS ABROAD — update-check
// Polls the site every few minutes; if the data file has been
// updated server-side since this page first loaded, shows a
// small "new content — refresh" banner. Keeps visitors fresh.
// ============================================================

(function () {
  const POLL_INTERVAL = 5 * 60 * 1000;  // 5 minutes
  const VERSION_FILE  = 'data.js';
  let initialMarker = null;

  async function probe() {
    try {
      // Bust browser cache for the HEAD check itself
      const r = await fetch(VERSION_FILE + '?cb=' + Date.now(), { method: 'HEAD' });
      const marker = r.headers.get('ETag') || r.headers.get('Last-Modified');
      if (!marker) return;
      if (!initialMarker) {
        initialMarker = marker;
        return;
      }
      if (marker !== initialMarker) {
        showBanner();
      }
    } catch (e) {
      // Offline or network error — silently ignore
    }
  }

  function showBanner() {
    if (document.getElementById('updateBanner')) return;
    const b = document.createElement('div');
    b.id = 'updateBanner';
    b.innerHTML = `
      <span class="ub-text">New content —</span>
      <button class="ub-btn" type="button">refresh ↻</button>
    `;
    Object.assign(b.style, {
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#2a241a',
      color: '#fbf4e1',
      padding: '10px 14px 10px 16px',
      borderRadius: '40px',
      fontFamily: "'Caveat', cursive",
      fontSize: '18px',
      zIndex: '9999',
      boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      maxWidth: 'calc(100% - 24px)',
    });
    const btn = b.querySelector('.ub-btn');
    Object.assign(btn.style, {
      background: '#fbf4e1',
      color: '#2a241a',
      border: 'none',
      padding: '6px 14px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontFamily: "'Caveat', cursive",
      fontSize: '17px',
    });
    btn.addEventListener('click', () => {
      // Force a full reload (bypass cache where possible)
      location.reload();
    });
    document.body.appendChild(b);
  }

  // Establish a baseline on load, then poll
  probe();
  setInterval(probe, POLL_INTERVAL);

  // Also re-check when the tab becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') probe();
  });
})();
