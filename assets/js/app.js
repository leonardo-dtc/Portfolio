/* Terminal navigation: cancellable transitions, ordinary history, readable fallbacks. */
(() => {
  'use strict';
  const body = document.body, root = document.documentElement;
  const panels = [...document.querySelectorAll('.panel')];
  const links = [...document.querySelectorAll('[data-nav]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 900px) and (min-height: 620px)');
  const $ = s => document.querySelector(s);
  let current = 0, routeSlug = '', motion = [], typing = 0, scrollFrame = 0;
  let lastWheel = 0, wheelSum = 0, wheelUsed = false;
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const stopMotion = () => { motion.forEach(a => a.cancel()); motion = []; clearInterval(typing); };
  function command(text) {
    const output = $('#sbar-cmd');
    clearInterval(typing);
    output.textContent = reduced.matches ? text : '';
    if (reduced.matches) return;
    let n = 0;
    typing = setInterval(() => { output.textContent = text.slice(0, ++n); if (n >= text.length) clearInterval(typing); }, 12);
  }
  function chrome(index, slug = '') {
    const changed = index !== current;
    current = index; routeSlug = slug; body.classList.toggle('is-reading', index > 0);
    panels.forEach((p,i) => p.classList.toggle('is-active',i === index));
    links.forEach((a, i) => {
      if (i === index) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
    $('#counter').textContent = String(index).padStart(2, '0');
    $('#counter-total').textContent = '/ 07';
    $('#rail-bar').style.width = ((index + 1) / panels.length * 100) + '%';
    $('#sbar-pwd').textContent = index ? '~/' + panels[index].id : '~';
    $('#sbar-host').textContent = 'leonardo@carvalho';
    $('#mode-link').href = 'low-detail.html?theme=' + (root.dataset.theme === 'light' ? 'light' : 'dark') + '#' + panels[index].id + (slug ? '/' + slug : '');
    $('#hint').textContent = wide.matches ? (slug ? 'Esc to return' : 'scroll · ← → · 1 to 8') : 'scroll to explore';
    window.LCField?.setDim(index > 0);
    if (changed || !body.classList.contains('is-ready')) emit('lc:panel', { index, sect: panels[index].id });
    emit('lc:sub', { sect: panels[index].id, slug: slug || null });
    if (index === 0) emit('lc:show');
  }
  function print(target) {
    if (reduced.matches || !wide.matches) return;
    const blocks = [...target.querySelectorAll('.chapter-name,.chapter-lede,.entry,.sub__title,.sub__lede,.about__copy > .lede')];
    motion = blocks.map((node, i) => node.animate([
      { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }
    ], { duration: 260, delay: Math.min(i * 24, 130), easing: 'cubic-bezier(.16,1,.3,1)' }));
  }
  function clearDetail(panel) {
    const sub = panel.querySelector('.subpage');
    if (!sub) return;
    sub.remove(); panel.classList.remove('is-sub'); delete panel.dataset.openSlug;
    panel.querySelector('.entries').hidden = false;
  }
  function showDetail(panel, slug) {
    const entry = [...panel.querySelectorAll('.entry__open')].find(el => el.dataset.slug === slug)?.closest('.entry');
    if (!entry) return false;
    const sub = document.createElement('div'); sub.className = 'subpage';
    const back = document.createElement('button'); back.type = 'button'; back.className = 'sub__back'; back.dataset.back = '';
    back.innerHTML = '<span aria-hidden="true">$ cd ..</span> <span>Back to ' + panel.querySelector('.chapter-name').textContent + '</span>';
    const title = document.createElement('h2'); title.className = 'sub__title'; title.tabIndex = -1; title.textContent = entry.querySelector('.entry__open').textContent;
    const meta = entry.querySelector('.entry__meta').cloneNode(true);
    const prose = document.createElement('div'); prose.className = 'sub__body';
    const lede = entry.querySelector('.entry__body').cloneNode(true); lede.className = 'sub__lede';
    prose.append(lede);
    const source = entry.querySelector('.entry__more');
    [...source.childNodes].forEach(node => prose.append(node.cloneNode(true)));
    sub.append(back, title, meta, prose); panel.append(sub);
    panel.querySelector('.entries').hidden = true; panel.classList.add('is-sub'); panel.dataset.openSlug = slug;
    return true;
  }
  function navigate(index, slug = '', { history = true, focus = false, animate = true } = {}) {
    if (index < 0 || index >= panels.length) return;
    stopMotion();
    const oldSlug = routeSlug, oldPanel = panels[current];
    // Close games before their source nodes are replaced.
    emit('lc:sub', { sect: oldPanel.id, slug: null });
    panels.forEach(clearDetail);
    const panel = panels[index];
    if (slug && !showDetail(panel, slug)) slug = '';
    panels.forEach(p => { p.classList.toggle('is-active', p === panel); p.hidden = wide.matches && p !== panel; });
    chrome(index, slug);
    if (history) {
      const hash = '#' + panel.id + (slug ? '/' + slug : '');
      if (location.hash !== hash) window.history.pushState(null, '', hash);
    }
    panel.scrollTop = 0;
    if (!wide.matches) (panel.querySelector('.subpage') || panel.querySelector('.chapter-name') || panel).scrollIntoView({ behavior: 'instant', block: 'start' });
    command(slug ? 'cat ' + slug + '.txt' : (index ? 'cd ' + panel.id : './portfolio'));
    if (animate) print(panel.querySelector('.subpage') || panel);
    if (focus) {
      const target = slug ? panel.querySelector('.sub__title') : (oldSlug && oldPanel === panel ? [...panel.querySelectorAll('.entry__open')].find(b => b.dataset.slug === oldSlug) : null) || panel.querySelector('h2,h1');
      if (target) { target.tabIndex = target.matches('button') ? 0 : -1; target.focus({ preventScroll: true }); }
    }
  }
  function readHash() {
    let hash;
    try { hash = decodeURIComponent(location.hash.slice(1)); } catch (_) { hash = ''; }
    const [sect, slug = ''] = hash.split('/');
    const index = panels.findIndex(p => p.id === (sect === 'contact' ? 'about' : sect));
    navigate(Math.max(0, index), slug, { history: false, animate: false });
    if (sect === 'contact') $('#contact').scrollIntoView({ block: 'center' });
  }
  function mode() {
    stopMotion(); body.classList.toggle('mode-panels', wide.matches); body.classList.toggle('mode-flow', !wide.matches);
    panels.forEach((p,i) => { p.hidden = wide.matches && i !== current; });
    if (wide.matches) window.scrollTo(0, 0);
    else if (body.classList.contains('is-ready')) { const panel = panels[current]; requestAnimationFrame(() => (panel.querySelector('.subpage') || panel.querySelector('.chapter-name') || panel).scrollIntoView({ behavior: 'instant', block: 'start' })); }
  }
  links.forEach(a => a.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(+a.dataset.nav, '', { focus: true });
  }));
  document.addEventListener('click', event => {
    const open = event.target.closest('.entry__open');
    if (open) { navigate(panels.indexOf(open.closest('.panel')), open.dataset.slug, { focus: true }); return; }
    const back = event.target.closest('[data-back]');
    if (back) { navigate(panels.indexOf(back.closest('.panel')), '', { focus: true }); return; }
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor && !anchor.matches('[data-nav]')) {
      const index = panels.findIndex(p => '#' + p.id === anchor.getAttribute('href'));
      if (index >= 0) { event.preventDefault(); navigate(index, '', { focus: true }); }
    }
  });
  addEventListener('popstate', readHash);
  addEventListener('hashchange', readHash);
  wide.addEventListener('change', mode);
  addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey || $('dialog[open]') || event.target.closest('input,textarea,select,[contenteditable="true"],.term')) return;
    if (event.key === 'Escape' && routeSlug) { event.preventDefault(); navigate(current, '', { focus: true }); return; }
    if (event.target.closest('button,a')) return;
    if (!wide.matches) return;
    let next = current;
    if (event.key === 'ArrowRight') next++;
    else if (event.key === 'ArrowLeft') next--;
    else if (/^[1-8]$/.test(event.key)) next = +event.key - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = panels.length - 1;
    else return;
    event.preventDefault(); navigate(next);
  });
  addEventListener('wheel', event => {
    if (!wide.matches || routeSlug || event.ctrlKey || event.metaKey || $('dialog[open]') || event.target.closest('.term,.table-wrap')) return;
    const now = performance.now();
    if (now - lastWheel > 180) { wheelSum = 0; wheelUsed = false; }
    lastWheel = now;
    if (wheelUsed || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const panel = panels[current], down = event.deltaY > 0;
    const canScroll = down ? panel.scrollTop + panel.clientHeight < panel.scrollHeight - 3 : panel.scrollTop > 3;
    // A gesture that scrolls the text cannot unexpectedly advance a chapter.
    if (canScroll) { wheelUsed = true; return; }
    wheelSum += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(wheelSum) > 60) { event.preventDefault(); wheelUsed = true; navigate(current + (down ? 1 : -1)); }
  }, { passive: false });
  addEventListener('scroll', () => {
    if (wide.matches || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      // Game layout changes must not be mistaken for chapter navigation.
      if (document.querySelector('.has-game')) return;
      const line = $('#nav').getBoundingClientRect().bottom + 80;
      let index = 0;
      panels.forEach((p,i) => { if ((p.querySelector('.subpage') || p.querySelector('.chapter-name') || p).getBoundingClientRect().top <= line) index = i; });
      if (index !== current) chrome(index, panels[index].dataset.openSlug || '');
    });
  }, { passive: true });
  function themeLabel() {
    const light = root.dataset.theme === 'light';
    $('#theme-toggle').textContent = light ? '[dark theme]' : '[light theme]';
    $('#theme-toggle').setAttribute('aria-label', 'Switch to ' + (light ? 'dark' : 'light') + ' theme');
    $('meta[name="theme-color"]').content = light ? '#f4f2ec' : '#0e0e0e';
    $('#mode-link').href = 'low-detail.html?theme=' + (light ? 'light' : 'dark') + '#' + panels[current].id + (routeSlug ? '/' + routeSlug : '');
  }
  $('#theme-toggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('lc-theme', root.dataset.theme); } catch (_) {}
    themeLabel(); emit('lc:theme', { theme: root.dataset.theme });
  });
  const help = $('#help-dialog');
  $('#help-toggle').addEventListener('click', () => help.showModal());
  help.querySelector('[data-close-dialog]').addEventListener('click', () => help.close());
  help.addEventListener('close', () => $('#help-toggle').focus());
  document.addEventListener('mouseover', e => {
    const stop = e.target.closest('.tl__stop'); if (stop) timeline(stop, false);
  });
  document.addEventListener('focusin', e => {
    const stop = e.target.closest('.tl__stop'); if (stop) timeline(stop, true);
  });
  document.addEventListener('click', e => {
    const stop = e.target.closest('.tl__stop'); if (stop) timeline(stop, true);
  });
  document.addEventListener('mouseout', e => {
    const tl = e.target.closest('.tl');
    if (tl && !tl.contains(e.relatedTarget)) { const stop = tl.querySelector('[data-on="1"]'); if (stop) timeline(stop, false); }
  });
  function timeline(stop, pin) {
    const tl = stop.closest('.tl');
    if (pin) tl.querySelectorAll('.tl__stop').forEach(s => { s.dataset.on = s === stop ? '1' : '0'; });
    const out = tl.nextElementSibling;
    const b = document.createElement('b'); b.textContent = stop.querySelector('.tl__yr').textContent + ' ';
    out.replaceChildren(b, document.createTextNode(stop.dataset.team));
  }
  document.querySelectorAll('.flip').forEach(el => {
    const text = el.textContent.trim(); el.setAttribute('aria-label', text); el.textContent = '';
    [...text].forEach((char, i) => {
      const span = document.createElement('span'); span.className = 'ch'; span.setAttribute('aria-hidden','true'); span.style.setProperty('--i',i);
      const a = document.createElement('i'); a.textContent = char === ' ' ? '\u00a0' : char;
      span.append(a,a.cloneNode(true)); el.append(span);
    });
  });
  let printDetails = [];
  addEventListener('beforeprint', () => {
    stopMotion(); printDetails = panels.map(p => p.hidden); panels.forEach(p => { p.hidden = false; });
  });
  addEventListener('afterprint', () => panels.forEach((p,i) => { p.hidden = printDetails[i]; }));
  reduced.addEventListener('change', () => { stopMotion(); emit('lc:show'); });
  themeLabel(); mode(); readHash(); body.classList.add('is-ready');
  const initialHash = location.hash;
  let interacted = false;
  document.addEventListener('pointerdown', () => { interacted = true; }, {once:true});
  document.addEventListener('keydown', () => { interacted = true; }, {once:true});
  document.fonts?.ready.then(() => { if (!interacted && !wide.matches && initialHash && location.hash === initialHash) readHash(); });
  // No loading curtain: the document is usable while the one hero reveal plays.
  if (!reduced.matches && current === 0) {
    const wave = { ox: 0, oy: 0, t0: performance.now(), speed: 2400, band: 100 };
    window.LCField?.reveal(wave); emit('lc:wave',wave);
  } else { window.LCField?.show(); emit('lc:show'); }
})();
