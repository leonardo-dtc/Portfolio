/* Preserve the existing live ASCII pieces on a separate, readable canvas. */
(() => {
  'use strict';
  if (!window.LCField) return;
  const registry = new Map(), stages = new Map();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 'intro', slug = '', trigger = null, last = 0, revision = 0;
  const captions = {
    'about': 'Leonardo Carvalho. ASCII portrait from a photograph.',
    'athletics/prep-and-showcase': 'Hockey rink diagram, showing the offensive zone.',
    'athletics': 'Goaltender’s mask, rendered from a 3D model.',
    'academics': 'Zebra portrait, rendered from a photograph.',
    'academics/groton': 'Groton Schoolhouse, rendered from a campus photograph.',
    'academics/american-heritage': 'American Heritage School crest. Small lettering is represented as texture.',
    'athletics/road-to-groton': 'Florida Alliance crest. Small lettering is represented as texture.',
    'academics/robotics': 'Rocket launch illustration, based on a photograph. Not the team’s rocket.',
    'music/carnegie-hall': 'Grand piano illustration. Adriano accompanied Leonardo’s violin performance on piano.',
    'research/aducanumab': 'Illustration of a brain scan with ARIA-like features. A schematic, not a patient image.',
    'research/genuvalens': 'Conceptual knee-exoskeleton illustration: cuffs, hinge and actuator. Not a tested device.',
    'research/toolkit': 'ARIA in the analyzed reports: aducanumab 37.2%, lecanemab 25.7%, donanemab 34.0%. These are reporting proportions, not patient risks.',
    'leadership/ocapex': 'An ASCII interpretation of the OCAPEX music mark.',
    'leadership/imagina': 'Mexico, with León marked. The Sound of Giving was streamed to children there.',
    'leadership/congressional-award': 'U.S. Capitol illustration, viewed from the east.',
    'build/daedalus': 'A changing labyrinth, illustrating the Daedalus game concept.',
    'build/loquar': 'Loquar’s speech bubble and globe, joining and separating.',
    'music/amora': 'A string quartet: two violins, a viola and a cello.',
    'music': 'Metronome. Move the pointer to change the tempo.',
  };
  function choose(sect, sub) {
    let base = null, detail = null;
    registry.forEach((a,key) => {
      if (a.panel !== sect) return;
      if (a.sub === sub && sub) detail = {a,key};
      else if (!a.sub && !base) base = {a,key};
    });
    return detail || base;
  }
  function caption(piece) {
    const a = piece.a, address = a.panel + (a.sub ? '/' + a.sub : '');
    let text = captions[address] || a.caption || 'ASCII illustration.';
    if (reduced.matches) text = text.replace(' Move the pointer to change the tempo.','').replace(/[;,]? (?:they scissor|turning|the cursor[^.]*).*?\./g,'.');
    return text;
  }
  const dialog = document.createElement('dialog'); dialog.id = 'art-dialog'; dialog.className = 'terminal-dialog art-dialog';
  dialog.setAttribute('aria-labelledby','art-title');
  dialog.innerHTML = '<div class="dialog-head"><h2 id="art-title">Artwork</h2><button type="button" id="art-close" autofocus>Close</button></div><figure><canvas role="img"></canvas><figcaption></figcaption></figure>';
  document.body.append(dialog);
  const enlarged = { canvas: dialog.querySelector('canvas'), caption: dialog.querySelector('figcaption'), figure: dialog.querySelector('figure'), large: true };
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { enlarged.piece = null; trigger?.focus({preventScroll:true}); });
  function enlarge(stage, source) {
    if (!stage?.piece) return;
    trigger = source; enlarged.piece = stage.piece; enlarged.cache = null;
    enlarged.caption.textContent = caption(stage.piece); enlarged.canvas.setAttribute('aria-label', enlarged.caption.textContent);
    dialog.showModal(); render(enlarged, performance.now(), true);
  }
  document.querySelectorAll('.panel:not(.panel--intro)').forEach(panel => {
    const figure = document.createElement('figure'); figure.className = 'art-stage';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'art-stage__open';
    const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden','true');
    const cap = document.createElement('figcaption');
    const hint = document.createElement('span'); hint.className='art-stage__hint'; hint.textContent='[enlarge artwork]'; hint.setAttribute('aria-hidden','true');
    button.append(canvas,hint); figure.append(button,cap); panel.querySelector('.chapter__side').append(figure);
    const stage = {figure,canvas,caption:cap,button,piece:null}; stages.set(panel.id,stage);
    button.addEventListener('click', () => enlarge(stage,button));
  });
  document.getElementById('ui-toggle').addEventListener('click', event => enlarge(stages.get(current),event.currentTarget));
  function refresh() {
    stages.forEach((stage,sect) => {
      stage.piece = choose(sect, sect === current ? slug : null); stage.cache = null;
      stage.figure.hidden = !stage.piece;
      if (!stage.piece) return;
      stage.caption.textContent = caption(stage.piece);
      stage.button.setAttribute('aria-label','Enlarge artwork: ' + stage.caption.textContent);
    });
    document.getElementById('ui-toggle').hidden = !stages.get(current)?.piece;
    revision++;
  }
  // Existing pieces keep their registration contract; ambient noise stays independent.
  window.LCField.setArt = (key,a) => { registry.set(key,a); refresh(); };
  window.LCField.showArt = () => refresh();
  document.addEventListener('lc:panel', e => { current=e.detail.sect;slug='';refresh(); });
  document.addEventListener('lc:sub', e => { if(e.detail.sect!==current)return;slug=e.detail.slug||'';refresh(); });
  document.addEventListener('lc:palette', () => { revision++; });
  document.addEventListener('lc:theme', () => { revision++; });
  addEventListener('resize', () => { revision++; });
  reduced.addEventListener('change', () => { refresh(); });
  function sample(a,cols,rows) {
    const out=new Float32Array(cols*rows);
    if(a.live) return out;
    for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
      const x0=Math.floor(x*a.cols/cols),x1=Math.max(x0+1,Math.floor((x+1)*a.cols/cols));
      const y0=Math.floor(y*a.rows/rows),y1=Math.max(y0+1,Math.floor((y+1)*a.rows/rows));
      let total=0,on=0,n=0;
      for(let sy=y0;sy<y1;sy++)for(let sx=x0;sx<x1;sx++){const v=a.dens[sy*a.cols+sx];n++;if(v>=0){total+=v;on++;}}
      out[y*cols+x]=on && on>=n*.4 ? total/on : -1;
    }
    return out;
  }
  function render(stage,now,force=false) {
    if(!stage.piece)return;
    const canvas=stage.canvas, rect=canvas.getBoundingClientRect();
    if(!rect.width||!rect.height||rect.bottom<0||rect.top>innerHeight)return;
    const a=stage.piece.a;
    if(!force && stage.drawRevision===revision && (!a.live || reduced.matches))return;
    const W=rect.width,H=rect.height,dpr=Math.min(2,devicePixelRatio||1);
    const ratio=a.cols ? a.cols/a.rows : a.aspect||1;
    const maxW=W*.93,maxH=H*.92;
    const h=Math.min(maxH,maxW/ratio),w=h*ratio;
    const cols=Math.max(12,Math.round(w/(stage.large?5:4))),rows=Math.max(12,Math.round(cols/ratio));
    if(!stage.cache || stage.cache.cols!==cols || stage.cache.rows!==rows || stage.cache.a!==a)stage.cache={a,cols,rows,out:sample(a,cols,rows)};
    const out=stage.cache.out;
    if(a.live)a.live(reduced.matches?0:now,cols,rows,out);
    if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);}
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const css=getComputedStyle(document.documentElement),ink=css.getPropertyValue(document.documentElement.dataset.theme === 'light' ? '--ac' : '--ac-hi').trim();
    const dx=w/cols,dy=h/rows,x0=(W-w)/2,y0=(H-h)/2;
    ctx.fillStyle=ink;ctx.font=(dy*1.15)+'px Menlo, monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    const ramp=' .░▒▓█';
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const d=out[y*cols+x];if(d<0)continue;
      const v=Math.max(0,Math.min(1,d));
      ctx.globalAlpha=.7+.3*v;
      ctx.fillText(ramp[Math.max(1,Math.round(v*(ramp.length-1)))],x0+(x+.5)*dx,y0+(y+.5)*dy,dx*1.3);
    }
    ctx.globalAlpha=1;stage.drawRevision=revision;
  }
  function frame(now){
    requestAnimationFrame(frame);
    if(document.hidden||now-last<1000/24)return;last=now;
    if(dialog.open)render(enlarged,now); else stages.forEach(stage=>render(stage,now));
  }
  requestAnimationFrame(frame);
  // Read-only access supports auditing every registered piece and its caption.
  window.LCArtwork={registry,stages};
})();
