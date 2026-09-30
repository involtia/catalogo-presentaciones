/*
 * Efectos X del catálogo (aún no usados en ninguna presentación).
 * Cada efecto recibe el elemento raíz de su demo y devuelve una timeline de GSAP.
 * Para llevar uno a una presentación, se conecta como un tipo más en anim.js.
 */
(() => {
  const $ = (root, sel) => root.querySelector(sel);
  const $$ = (root, sel) => [...root.querySelectorAll(sel)];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const GLYPHS = '01<>/#%&*+=ABCDEF';

  // texto original guardado la primera vez, para poder repetir
  const txt = el => (el.dataset.text ??= el.textContent);

  const FX = {
    // X1 · capas desplazadas y cortes horizontales durante un instante
    glitch(root) {
      const el = $(root, '.fx-glitch'); const t = txt(el);
      if (!el.querySelector('.gl')) {
        el.innerHTML = `<span class="gl base">${t}</span><span class="gl g1" aria-hidden="true">${t}</span><span class="gl g2" aria-hidden="true">${t}</span>`;
      }
      const [g1, g2] = [$(el, '.g1'), $(el, '.g2')];
      const tl = gsap.timeline();
      for (let i = 0; i < 12; i++) {
        const a = rnd(0, 80), b = rnd(a + 5, 100);
        tl.set(g1, { x: rnd(-14, 14), autoAlpha: 1, clipPath: `inset(${a}% 0 ${100 - b}% 0)` }, i * .05)
          .set(g2, { x: rnd(-14, 14), autoAlpha: 1, clipPath: `inset(${rnd(0, 90)}% 0 ${rnd(0, 60)}% 0)` }, i * .05)
          .set($(el, '.base'), { x: rnd(-3, 3) }, i * .05);
      }
      return tl.set([g1, g2], { autoAlpha: 0, x: 0 }).set($(el, '.base'), { x: 0 });
    },

    // X2 · carácter a carácter con cursor
    typewriter(root) {
      const el = $(root, '.fx-type'); const t = txt(el);
      el.innerHTML = '<span class="tw"></span><i class="caret"></i>';
      const out = $(el, '.tw'); const o = { n: 0 };
      return gsap.timeline().to(o, {
        n: t.length, duration: t.length * .045, ease: 'none',
        onUpdate: () => { out.textContent = t.slice(0, Math.round(o.n)); },
      });
    },

    // X3 · las letras pasan por caracteres aleatorios hasta fijarse
    scramble(root) {
      const el = $(root, '.fx-scramble'); const t = txt(el); const o = { p: 0 };
      return gsap.timeline().to(o, {
        p: 1, duration: 1.4, ease: 'power1.inOut',
        onUpdate: () => {
          const fixed = Math.floor(o.p * t.length);
          el.textContent = [...t].map((c, i) => (i < fixed || c === ' ') ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('');
        },
        onComplete: () => { el.textContent = t; },
      });
    },

    // X4 · se ilumina un elemento y los demás se apagan
    focus(root) {
      const items = $$(root, '.item');
      const tl = gsap.timeline();
      tl.set(items, { opacity: 1, filter: 'blur(0px)' });
      items.forEach((it, i) => {
        tl.to(items.filter(x => x !== it), { opacity: .22, filter: 'blur(2px)', duration: .45 }, i ? '+=0.9' : '+=0.4')
          .to(it, { opacity: 1, filter: 'blur(0px)', duration: .45 }, '<');
      });
      return tl.to(items, { opacity: 1, filter: 'blur(0px)', duration: .45 }, '+=0.9');
    },

    // X5 · capas que se desplazan a distinta velocidad
    parallax(root) {
      const tl = gsap.timeline();
      $$(root, '[data-depth]').forEach(l => {
        const d = +l.dataset.depth;
        tl.fromTo(l, { x: 260 * d, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.4, ease: 'power3.out' }, 0);
      });
      return tl;
    },

    // X6 · puntos de luz flotando (bucle continuo en canvas)
    particles(root) {
      const cv = $(root, 'canvas');
      if (!cv._on) {
        cv._on = true;
        const ctx = cv.getContext('2d'); const W = cv.width, H = cv.height;
        const ps = Array.from({ length: 70 }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(.6, 2.4), vx: rnd(-.15, .15), vy: rnd(-.35, -.05), a: rnd(.2, .9) }));
        gsap.ticker.add(() => {
          ctx.clearRect(0, 0, W, H);
          ps.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.y < -4) { p.y = H + 4; p.x = rnd(0, W); }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
            ctx.fillStyle = `rgba(168,212,0,${p.a})`; ctx.shadowColor = '#a8d400'; ctx.shadowBlur = 8; ctx.fill();
          });
        });
      }
      return gsap.timeline().fromTo(cv, { autoAlpha: 0 }, { autoAlpha: 1, duration: .8 });
    },

    // X7 · textura de ruido fino animada
    grain(root) {
      const g = $(root, '.fx-grain');
      if (!g.style.backgroundImage) {
        const c = document.createElement('canvas'); c.width = c.height = 160;
        const x = c.getContext('2d'); const d = x.createImageData(160, 160);
        for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 34; }
        x.putImageData(d, 0, 0); g.style.backgroundImage = `url(${c.toDataURL()})`;
      }
      return gsap.timeline().fromTo(g, { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 });
    },

    // X8 · franjas de monitor con leve parpadeo
    crt(root) {
      return gsap.timeline().fromTo($(root, '.fx-crt'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 });
    },

    // X9 · máscara circular que se abre desde el centro
    iris(root) {
      return gsap.timeline().fromTo($(root, '.fx-iris'), { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.2, ease: 'power3.inOut' });
    },

    // X10 · cada dígito gira como un contador mecánico
    odometer(root) {
      const el = $(root, '.fx-odo'); const t = txt(el);
      if (!el.querySelector('.reel')) {
        el.innerHTML = [...t].map(c => /\d/.test(c)
          ? `<span class="win"><span class="reel" data-d="${c}">${[...Array(20).keys()].map(n => `<span>${n % 10}</span>`).join('')}</span></span>`
          : `<span class="sep">${c}</span>`).join('');
      }
      const reels = $$(el, '.reel');
      return gsap.timeline().fromTo(reels, { yPercent: 0 },
        { yPercent: i => -((10 + +reels[i].dataset.d) / 20) * 100, duration: 1.6, ease: 'power3.out', stagger: .12 });
    },

    // X11 · reflejo diagonal que pasa por encima
    shimmer(root) {
      return gsap.timeline().fromTo($(root, '.fx-shine'), { xPercent: -120 }, { xPercent: 220, duration: 1.1, ease: 'power2.inOut' });
    },

    // X12 · el contorno se traza antes de que aparezca el contenido
    border(root) {
      const p = $(root, '.fx-border path'); const L = p.getTotalLength();
      p.style.strokeDasharray = L;
      return gsap.timeline()
        .set($(root, '.fx-border-in'), { autoAlpha: 0 })
        .fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
        .to($(root, '.fx-border-in'), { autoAlpha: 1, duration: .5 }, '-=0.2');
    },

    // X13 · cae y rebota
    bounce(root) {
      return gsap.timeline().fromTo($(root, '.item'), { y: -260, autoAlpha: 1 }, { y: 0, duration: 1.2, ease: 'bounce.out' });
    },

    // X14 · gira en 3D como una carta
    flip(root) {
      return gsap.timeline().fromTo($(root, '.fx-card'), { rotateY: 180 }, { rotateY: 0, duration: 1.2, ease: 'power3.inOut', transformPerspective: 1200 });
    },

    // X15 · acercamiento a una zona de la imagen
    zoom(root) {
      const img = $(root, '.fx-zoom img'); const ring = $(root, '.fx-ring');
      return gsap.timeline()
        .set(img, { scale: 1, transformOrigin: '72% 30%' }).set(ring, { autoAlpha: 0 })
        .to(img, { scale: 2.6, duration: 1.3, ease: 'power3.inOut' }, .2)
        .fromTo(ring, { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: .4 })
        .to(ring, { autoAlpha: 0, duration: .3 }, '+=1')
        .to(img, { scale: 1, duration: 1, ease: 'power3.inOut' });
    },
  };

  window.InmakerFX = FX;
})();
