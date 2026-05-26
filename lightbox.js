// ============================================================
// SHAFFERS ABROAD — lightbox
// Click any photo on the site → fullscreen view on a dim
// background. Click anywhere on the overlay (or ESC) to close.
// Skips the hero poster on the homepage (which has its own
// long-press behavior).
// ============================================================

(function () {
  // Build the overlay once
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(20, 15, 8, 0.92)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9998',
    cursor: 'zoom-out',
    padding: '24px',
    opacity: '0',
    transition: 'opacity 0.18s ease',
    flexDirection: 'column',
    gap: '14px',
  });

  const img = document.createElement('img');
  Object.assign(img.style, {
    maxWidth: '100%',
    maxHeight: '90%',
    objectFit: 'contain',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
    background: '#fff',
    padding: '8px',
  });

  const hint = document.createElement('div');
  hint.textContent = 'tap to close';
  Object.assign(hint.style, {
    fontFamily: "'Caveat', cursive",
    color: 'rgba(251, 244, 225, 0.7)',
    fontSize: '16px',
    letterSpacing: '1px',
  });

  overlay.appendChild(img);
  overlay.appendChild(hint);

  function open(src) {
    img.src = src;
    overlay.style.display = 'flex';
    // next frame, fade in
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      img.src = '';
      document.body.style.overflow = '';
    }, 180);
  }

  overlay.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') close();
  });

  // Wait for body to be ready before appending
  function attach() {
    if (document.body) {
      document.body.appendChild(overlay);
    } else {
      requestAnimationFrame(attach);
    }
  }
  attach();

  // Open the lightbox on any clickable image inside the paper container,
  // but skip the hero poster (long-press behavior) and skip anything that
  // is itself a link (the day-card cover photos sit inside <a> tags).
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    // Skip the flip-card poster
    if (t.closest('.flipCard')) return;
    // Skip the lightbox image itself
    if (t === img) return;
    // For images inside day-card links, do nothing here — let the link navigate
    if (t.closest('a.dayCard, a.lockLink, a.backLink, a.indexLink')) return;
    // Open lightbox for any other image inside the paper container
    if (!t.closest('.paper')) return;
    e.preventDefault();
    open(t.currentSrc || t.src);
  }, true);
})();
