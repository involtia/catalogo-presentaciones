/*
 * Animaciones GSAP sincronizadas con Reveal.js
 *
 *  data-in="tipo"            → entra sola al llegar a la diapositiva (data-at="s" fija el momento)
 *  class="fragment g" data-a → entra con cada pulsación (fragmento de Reveal animado por GSAP)
 *
 *  Tipos: up · down · left · right · scale · fade · chars · scan · draw
 *  <b data-count="50">       → contador de 0 al valor cuando su bloque entra
 *  <path class="trace" data-pulse> → la pista lleva un pulso de luz en bucle
 */
(() => {
  const EASE = 'power3.out';
  const FROM = {
    up:    { autoAlpha: 0, y: 48,  filter: 'blur(10px)' },
    down:  { autoAlpha: 0, y: -40, filter: 'blur(10px)' },
    left:  { autoAlpha: 0, x: -70, filter: 'blur(10px)' },
    right: { autoAlpha: 0, x: 70,  filter: 'blur(10px)' },
    scale: { autoAlpha: 0, scale: .82, filter: 'blur(14px)', transformOrigin: '50% 50%' },
    fade:  { autoAlpha: 0 },
  };
  const TO = { autoAlpha: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' };

  // 1800 → «1.800», 2.5 → «2,5»
  const fmt = (v, dec) => {
    const [i, d] = v.toFixed(dec).split('.');
    return i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (d ? ',' + d : '');
  };
  const kind = el => el.dataset.a || el.dataset.in || 'up';
  const len = p => (p._len ||= p.getTotalLength());

  // ---------- preparación única ----------
  function splitChars(node) {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(word => {
          if (!word) return;
          if (/^\s+$/.test(word)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w';
          [...word].forEach(ch => { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; w.append(c); });
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') splitChars(n);
    });
  }

  function prepare() {
    document.querySelectorAll('[data-a="chars"], [data-in="chars"]').forEach(splitChars);

    document.querySelectorAll('path.trace').forEach(p => {
      p.style.strokeDasharray = len(p);
      if (p.hasAttribute('data-pulse')) {
        const q = p.cloneNode(); q.removeAttribute('data-pulse');
        q.setAttribute('class', 'pulse'); q.style.strokeDasharray = `70 ${len(p) + 400}`;
        p.after(q);
        gsap.fromTo(q, { strokeDashoffset: 70 }, {
          strokeDashoffset: -len(p), ease: 'none', repeat: -1,
          duration: len(p) / 380 + .6, delay: Math.random() * 2, repeatDelay: .6 + Math.random() * 1.6,
        });
      }
    });
  }

  // ---------- estados ----------
  function hide(el, dur = 0) {
    const v = { duration: dur, ease: 'power2.in', overwrite: 'auto' };
    const k = kind(el);
    if (k === 'chars') {
      gsap.set(el, { autoAlpha: 1 });
      gsap.to(el.querySelectorAll('.c'), { ...v, autoAlpha: 0, y: '0.45em', rotateX: -85 });
    } else if (k === 'scan') {
      gsap.to(el, { ...v, autoAlpha: 1, clipPath: 'inset(0% 100% 0% 0%)' });
    } else if (k === 'draw') {
      gsap.set(el, { autoAlpha: 1 });
      el.querySelectorAll('.trace').forEach(p => gsap.to(p, { ...v, strokeDashoffset: len(p) }));
      gsap.to(el.querySelectorAll('.pad, .pulse, .lbl'), { ...v, autoAlpha: 0 });
    } else {
      gsap.to(el, { ...v, ...FROM[k] });
    }
  }

  function show(el, instant = false) {
    const k = kind(el);
    const tl = gsap.timeline();
    if (k === 'chars') {
      gsap.set(el, { autoAlpha: 1 });
      tl.to(el.querySelectorAll('.c'), { autoAlpha: 1, y: 0, rotateX: 0, duration: .75, ease: EASE, stagger: .022 });
    } else if (k === 'scan') {
      tl.to(el, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: 'power3.inOut' });
      if (!instant) {
        const bar = el.querySelector(':scope > .scanbar') || el.appendChild(Object.assign(document.createElement('i'), { className: 'scanbar' }));
        tl.fromTo(bar, { left: '0%', autoAlpha: 1 }, { left: '100%', duration: .8, ease: 'power3.inOut' }, 0)
          .to(bar, { autoAlpha: 0, duration: .3 });
      }
    } else if (k === 'draw') {
      gsap.set(el, { autoAlpha: 1 });
      tl.to(el.querySelectorAll('.trace'), { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: .07 })
        .to(el.querySelectorAll('.pad, .pulse, .lbl'), { autoAlpha: 1, duration: .4, stagger: .03 }, '-=0.35');
    } else {
      tl.to(el, { ...TO, duration: .85, ease: EASE });
    }
    el.querySelectorAll('[data-count]').forEach(n => {
      const o = { v: 0 }, end = +n.dataset.count, dec = +(n.dataset.dec || 0);
      tl.to(o, { v: end, duration: 1.1, ease: 'power2.out', onUpdate: () => { n.textContent = fmt(o.v, dec); } }, .2);
    });
    if (instant) tl.progress(1);
    return tl;
  }

  // expuesto para el catálogo (catalogo.html), que no usa Reveal
  window.InmakerAnim = { prepare, show, hide };
  if (!window.Reveal) return;

  // ---------- sincronía con Reveal ----------
  function sync(slide, play) {
    slide.querySelectorAll('.fragment.g').forEach(f => f.classList.contains('visible') ? show(f, true) : hide(f));
    const ins = [...slide.querySelectorAll('[data-in]')];
    ins.forEach(e => hide(e));
    if (!play) return;
    const tl = gsap.timeline({ delay: .1 });
    ins.forEach((e, i) => tl.add(show(e), e.dataset.at != null ? +e.dataset.at : (i ? '-=0.6' : 0)));
  }

  function number() {
    Reveal.getSlides().forEach((s, i) => s.querySelectorAll('.page').forEach(n => { n.textContent = String(i + 1).padStart(2, '0'); }));
  }

  Reveal.on('ready', e => { prepare(); number(); Reveal.getSlides().forEach(s => sync(s, false)); sync(e.currentSlide, true); });

  Reveal.on('slidechanged', e => {
    const prev = e.previousSlide;
    sync(e.currentSlide, true);
    if (prev) gsap.delayedCall(.7, () => { if (prev !== Reveal.getCurrentSlide()) sync(prev, false); });
  });

  Reveal.on('fragmentshown', e => {
    const tl = gsap.timeline();
    e.fragments.filter(f => f.classList.contains('g')).forEach((f, i) => tl.add(show(f), i * .12));
  });
  Reveal.on('fragmenthidden', e => e.fragments.filter(f => f.classList.contains('g')).forEach(f => hide(f, .3)));
})();
