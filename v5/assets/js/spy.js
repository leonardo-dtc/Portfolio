// Sections that follow the reader. On a page with a table of contents (the Résumé's Sections), the section under the
// reading line (a quarter of the way down the window, at most 140px) marks its entry with aria-current and the tab
// bar's bubble style, a Fill 3 capsule. An IntersectionObserver on that line notices sections crossing it; reaching
// the end of the record marks the last section, however short. A jump from Sections marks its target at once and
// holds it until the scroll has arrived, so the bubble does not walk through every section in between. Below 1360px,
// where Sections is a row of chips, the current chip is kept in view.
export function initSpy() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let stop = () => {};

  function setup() {
    stop();
    const body = document.querySelector('#main > .win__body');
    const links = [...document.querySelectorAll('.toc a[href^="#"]')];
    if (!body || !links.length) return;
    const pairs = links.map(a => {
      const t = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      return t && body.contains(t) ? [t.closest('section') || t, a] : null;
    }).filter(Boolean);
    if (!pairs.length) return;
    const sections = pairs.map(p => p[0]);
    let current = null, held = null, holdT = 0, io = null;

    const line = () => Math.min(140, body.clientHeight * .25);
    function pick() {
      if (held) return held;
      if (body.scrollTop + body.clientHeight >= body.scrollHeight - 2) return sections[sections.length - 1];
      const y = body.getBoundingClientRect().top + line();
      let s = sections[0];
      for (const sec of sections) if (sec.getBoundingClientRect().top <= y) s = sec;
      return s;
    }
    function mark() {
      const s = pick();
      if (s === current) return;
      current = s;
      for (const [sec, a] of pairs) { if (sec === s) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }
      // the chip row scrolls the current chip into view (it never scrolls the window)
      const a = pairs.find(p => p[0] === s)[1], row = a.closest('.side__part--pin .toc');
      if (row) {
        const r = row.getBoundingClientRect(), c = a.getBoundingClientRect(), pad = 36;
        if (c.left < r.left + pad || c.right > r.right - pad) row.scrollTo({ left: row.scrollLeft + c.left - r.left - pad, behavior: reduced.matches ? 'auto' : 'smooth' });
      }
    }
    function observe() {
      if (io) io.disconnect();
      const top = Math.round(line()), rest = Math.max(0, Math.round(body.clientHeight - top - 1));
      io = new IntersectionObserver(mark, { root: body, rootMargin: `-${top}px 0px -${rest}px 0px` });
      sections.forEach(s => io.observe(s));
    }
    const atEnd = () => { if (body.scrollTop + body.clientHeight >= body.scrollHeight - 2 || current === sections[sections.length - 1]) mark(); };
    const release = () => { if (!held) return; held = null; clearTimeout(holdT); mark(); };
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('.toc a[href^="#"]');
      const pair = a && pairs.find(p => p[1] === a);
      if (!pair) return;
      held = pair[0]; clearTimeout(holdT); holdT = setTimeout(release, 1200);
      mark();
    };
    let resized = 0;
    const onResize = () => { clearTimeout(resized); resized = setTimeout(() => { observe(); mark(); }, 150); };

    observe();
    mark();
    body.addEventListener('scroll', atEnd, { passive: true });
    body.addEventListener('scrollend', release);
    document.addEventListener('click', onClick, true);
    addEventListener('resize', onResize);
    stop = () => {
      if (io) io.disconnect();
      clearTimeout(holdT); clearTimeout(resized);
      body.removeEventListener('scroll', atEnd);
      body.removeEventListener('scrollend', release);
      document.removeEventListener('click', onClick, true);
      removeEventListener('resize', onResize);
      stop = () => {};
    };
  }

  setup();
  document.addEventListener('v5:navigate', setup);
  return { refresh: setup };
}
