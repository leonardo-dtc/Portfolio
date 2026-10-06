// The Listening window (the archive page; listening() in tools/v5-chrome.mjs writes it): its card shows one song or
// album at a time, the newest first, as Spotify's now playing does on Vision Pro; Previous and Next step through them,
// and the list marks the one shown. An address that names one (archive/#creep) shows it. Delegated from the document,
// so it keeps working when a page swaps in place. Without the script the card shows the newest, and every row still
// opens its song where it plays.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

function show(player, track, dir = 0, say = false) {
  if (!player || !track) return;
  const now = player.querySelector('.player__now'), d = track.dataset;
  if (!now) return;
  const art = now.querySelector('.art');
  art.style.setProperty('--h', track.style.getPropertyValue('--h'));
  // a cover of its own takes the drawn artwork's place
  let img = art.querySelector('img');
  if (d.cover) {
    if (!img) { img = document.createElement('img'); img.alt = ''; img.decoding = 'async'; art.prepend(img); }
    if (img.getAttribute('src') !== d.cover) img.src = d.cover;
  } else if (img) img.remove();
  art.classList.toggle('art--img', !!d.cover);
  art.querySelector('b').textContent = d.title;
  art.querySelector('i').textContent = d.by || '';
  now.querySelector('.player__title').textContent = d.title;
  now.querySelector('.player__by').textContent = d.by || '';
  now.querySelector('.player__line').textContent = d.line || '';
  const go = now.querySelector('.player__listen');
  if (go && d.href) {
    go.href = d.href; go.rel = 'noopener'; go.hidden = false;
    go.classList.toggle('is-spotify', d.service === 'Spotify');
    // the service's name is the label's last words, after "Listen on " (a card first written without one has none)
    const label = go.querySelector('span');
    let name = label.lastChild;
    if (!name || name.nodeType !== Node.TEXT_NODE) name = label.appendChild(document.createTextNode(''));
    name.textContent = d.service;
  } else if (go) { go.removeAttribute('href'); go.hidden = true; }
  player.querySelectorAll('.track').forEach((t) => {
    const on = t === track, a = t.querySelector('.track__go');
    t.classList.toggle('is-current', on);
    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
  // the card turns over toward the way it went (at once under reduced motion)
  if (dir && !reduced.matches) {
    now.classList.remove('is-turning');
    void now.offsetWidth;
    now.style.setProperty('--turn', dir > 0 ? '16px' : '-16px');
    now.classList.add('is-turning');
  }
  if (say) { const live = document.querySelector('.sr-live'); if (live) live.textContent = `${d.title}${d.by ? `, ${d.by}` : ''}`; }
}

export function initListening() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-skip]');
    if (!b) return;
    const player = b.closest('[data-player]'), tracks = player ? [...player.querySelectorAll('.track')] : [];
    if (!tracks.length) return;
    const at = Math.max(0, tracks.findIndex(t => t.classList.contains('is-current'))), step = +b.dataset.skip || 1;
    show(player, tracks[(at + step + tracks.length) % tracks.length], step, true);
  });
  document.addEventListener('animationend', (e) => { if (e.target.classList && e.target.classList.contains('is-turning')) e.target.classList.remove('is-turning'); });
  const fromHash = () => {
    let id = '';
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (err) { return; }
    const t = id && document.getElementById(id);
    if (t && t.matches('[data-player] .track')) show(t.closest('[data-player]'), t);
  };
  fromHash();
  addEventListener('hashchange', fromHash);
  document.addEventListener('v5:navigate', fromHash);
}
