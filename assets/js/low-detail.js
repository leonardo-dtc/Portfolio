/* Progressive enhancement: content, section links and details work without JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js-ready');
  const themeButton = document.getElementById('theme-toggle');
  const artButton = document.getElementById('art-toggle');
  const dialog = document.getElementById('art-dialog');
  const dialogContent = document.getElementById('art-dialog-content');
  let artworkTrigger = null;
  // Photographic shading must reverse on paper; drawn symbols retain their ink.
  const tonalArt = [...document.querySelectorAll('.artwork--portrait pre, .artwork--athletics pre, .artwork--academics pre')].map(node => ({
    node,
    dark: node.textContent,
    light: node.textContent.replace(/[░▒▓█]/g, glyph => '█▓▒░'['░▒▓█'.indexOf(glyph)])
  }));

  const savePreference = (key, value) => {
    try { localStorage.setItem(key, value); } catch (_) { /* Use preferences for this visit. */ }
  };
  const themeLabel = () => {
    const light = root.dataset.theme === 'light';
    themeButton.textContent = light ? 'Dark theme' : 'Light theme';
    themeButton.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    document.querySelector('meta[name="theme-color"]').content = light ? '#f5f3ee' : '#111112';
    tonalArt.forEach(art => { art.node.textContent = light ? art.light : art.dark; });
  };
  themeButton.hidden = false;
  themeLabel();
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    savePreference('lc-theme', root.dataset.theme);
    themeLabel();
  });

  try { root.classList.toggle('hide-artwork', localStorage.getItem('lc-hide-artwork') === 'true'); } catch (_) {}
  const artworkLabel = () => {
    const hidden = root.classList.contains('hide-artwork');
    artButton.textContent = hidden ? 'Show artwork' : 'Hide artwork';
    artButton.setAttribute('aria-pressed', String(hidden));
  };
  artButton.hidden = false;
  artworkLabel();
  artButton.addEventListener('click', () => {
    root.classList.toggle('hide-artwork');
    savePreference('lc-hide-artwork', String(root.classList.contains('hide-artwork')));
    artworkLabel();
  });

  document.querySelectorAll('[data-artwork]').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      artworkTrigger = button;
      const source = button.closest('figure');
      const figure = document.createElement('figure');
      figure.className = 'artwork';
      figure.append(button.querySelector('pre').cloneNode(true));
      figure.append(source.querySelector('figcaption').cloneNode(true));
      dialogContent.replaceChildren(figure);
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });
  document.getElementById('art-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    artworkTrigger?.focus({ preventScroll: true });
  });

  const links = [...document.querySelectorAll('.header-inner nav a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  let scrollQueued = false;
  const markSection = () => {
    const readingLine = document.querySelector('.site-header').getBoundingClientRect().bottom + 80;
    let active = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) active = section;
    }
    if (document.getElementById('contact').getBoundingClientRect().top <= readingLine) active = null;
    links.forEach(link => {
      if (active && link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    document.getElementById('mode-link').href = 'index.html#' + (active ? active.id : 'intro');
    scrollQueued = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(markSection); }
  }, { passive: true });
  window.addEventListener('resize', markSection);
  markSection();

  // Native anchors preserve history, text selection and ordinary scrolling.
  const revealHash = () => {
    document.getElementById('mode-link').href = 'index.html' + location.hash;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    if (!id) return;
    let target = document.getElementById(id);
    if (!target && id.includes('/')) target = document.getElementById(id.split('/').pop());
    if (!target) return;
    const detail = target.matches('details') ? target : target.closest('details');
    if (detail) detail.open = true;
    if (id.includes('/')) target.scrollIntoView({ block: 'start' });
  };
  window.addEventListener('hashchange', revealHash);
  revealHash();

  // Carry the visible disclosure and theme back to the terminal, even if storage is unavailable.
  document.getElementById('mode-link').addEventListener('click', event => {
    const readingTop = document.querySelector('.site-header').getBoundingClientRect().bottom;
    const detail = [...document.querySelectorAll('details[open]')].find(el => {
      const rect = el.getBoundingClientRect(); return rect.top < innerHeight && rect.bottom > readingTop;
    });
    const active = document.querySelector('.header-inner nav a[aria-current]');
    const section = active ? active.hash : '#intro';
    event.currentTarget.href = 'index.html?theme=' + (root.dataset.theme === 'light' ? 'light' : 'dark') + (detail ? '#' + detail.id : section);
  });

  // Print the complete record, then restore the reader's disclosure state.
  let closedBeforePrint = [];
  window.addEventListener('beforeprint', () => {
    closedBeforePrint = [...document.querySelectorAll('details:not([open])')];
    closedBeforePrint.forEach(detail => { detail.open = true; });
  });
  window.addEventListener('afterprint', () => {
    closedBeforePrint.forEach(detail => { detail.open = false; });
    closedBeforePrint = [];
  });
})();
