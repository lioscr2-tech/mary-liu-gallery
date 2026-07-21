/* 刘彤 · 带着画笔看世界 (v3)
   Nothing pinned except the intro. Everything must simply work. */

(function () {
  'use strict';

  var EASE = 'power3.inOut';
  var DUR = { fast: 0.3, base: 0.6, slow: 1.1 };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  document.documentElement.classList.add(hasGsap && !reduceMotion ? 'js' : 'no-js');

  if (!hasGsap || reduceMotion) {
    var l = document.getElementById('loader');
    if (l) l.remove();
    initLightbox(null);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: EASE, duration: DUR.base });

  /* ————— Lenis ————— */
  var lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ————— Loader ————— */
  var loader = document.getElementById('loader');
  var countEl = document.getElementById('loaderCount');
  var t0 = performance.now();
  var progress = 0;
  var loaded = document.readyState === 'complete';
  window.addEventListener('load', function () { loaded = true; });

  var tick = setInterval(function () {
    progress = Math.min(progress + Math.random() * 9, loaded ? 100 : 90);
    countEl.textContent = Math.floor(progress);
    if (progress >= 100 && performance.now() - t0 >= 2200) {
      clearInterval(tick);
      countEl.textContent = '100';
      gsap.to(loader, {
        yPercent: -100, duration: DUR.slow, ease: 'power4.inOut', delay: 0.2,
        onComplete: function () { loader.remove(); }
      });
      heroIn();
    }
  }, 110);

  function heroIn() {
    gsap.from('.hero-eyebrow, .hero-cn, .hero-en, .hero-sub, .hero-hint', {
      y: 60, opacity: 0, stagger: 0.1, duration: DUR.slow, delay: 0.35
    });
    gsap.from('.lighthouse, .beam', { opacity: 0, duration: 1.6, delay: 0.6 });
    scramble(document.getElementById('scramble'), '带着画笔看世界', 1.0);
  }

  function scramble(el, finalText, delaySec) {
    var glyphs = '山水云路桥船灯花树光海风一二三四五六七';
    var frame = 0, obj = { p: 0 };
    gsap.to(obj, {
      p: 1, duration: 1.8, delay: delaySec || 0, ease: 'power2.out',
      onUpdate: function () {
        frame++;
        var lock = Math.floor(obj.p * finalText.length);
        var out = '';
        for (var i = 0; i < finalText.length; i++) {
          out += (i < lock) ? finalText[i] : glyphs[(frame * 5 + i * 11) % glyphs.length];
        }
        el.textContent = out;
      },
      onComplete: function () { el.textContent = finalText; }
    });
  }

  /* ————— Hero sky: stars, twinkle, shooting stars, dust ————— */
  (function sky() {
    var canvas = document.getElementById('stars');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, stars = [], motes = [], shooters = [];
    var isMobile = window.innerWidth < 769;
    var running = true;

    function size() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }
    function seed() {
      stars = []; motes = [];
      var ns = isMobile ? 60 : 130;
      for (var i = 0; i < ns; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h * 0.72,
          r: Math.random() * 1.3 + 0.3,
          tw: Math.random() * 6.28, ts: 0.5 + Math.random() * 1.5
        });
      }
      var nm = isMobile ? 18 : 45;
      for (var j = 0; j < nm; j++) {
        motes.push({
          x: Math.random() * w, y: Math.random() * h,
          r: 0.6 + Math.random() * 1.6,
          vx: -0.05 + Math.random() * 0.1, vy: 0.03 + Math.random() * 0.09,
          a: 0.06 + Math.random() * 0.22
        });
      }
    }
    size();
    window.addEventListener('resize', size);

    var nextShoot = performance.now() + 1800;
    function spawnShooter(now) {
      shooters.push({
        x: Math.random() * w * 0.8 + w * 0.1,
        y: Math.random() * h * 0.3 + 20,
        vx: -(4 + Math.random() * 4), vy: 2 + Math.random() * 2,
        life: 1
      });
      nextShoot = now + 2600 + Math.random() * 4200;
    }

    function draw(now) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      /* stars */
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = 0.35 + 0.65 * Math.abs(Math.sin(now / 1000 * s.ts + s.tw));
        ctx.globalAlpha = a * 0.8;
        ctx.fillStyle = '#DDE6F5';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
      }
      /* shooting stars */
      if (now > nextShoot) spawnShooter(now);
      for (var k = shooters.length - 1; k >= 0; k--) {
        var sh = shooters[k];
        sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.016;
        if (sh.life <= 0) { shooters.splice(k, 1); continue; }
        var grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 14, sh.y - sh.vy * 14);
        grad.addColorStop(0, 'rgba(255,235,200,' + (0.9 * sh.life) + ')');
        grad.addColorStop(1, 'rgba(255,235,200,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 14, sh.y - sh.vy * 14);
        ctx.stroke();
      }
      /* amber dust */
      ctx.fillStyle = '#F2A73B';
      for (var m = 0; m < motes.length; m++) {
        var mo = motes[m];
        mo.x += mo.vx; mo.y += mo.vy;
        if (mo.y > h + 4) { mo.y = -4; mo.x = Math.random() * w; }
        if (mo.x < -4) mo.x = w + 4; else if (mo.x > w + 4) mo.x = -4;
        ctx.globalAlpha = mo.a;
        ctx.beginPath(); ctx.arc(mo.x, mo.y, mo.r, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    ScrollTrigger.create({
      trigger: '#hero', start: 'top bottom', end: 'bottom top',
      onToggle: function (self) {
        running = self.isActive;
        if (running) requestAnimationFrame(draw);
      }
    });
  })();

  /* ————— Lamp + dot + magnetic ————— */
  if (finePointer) {
    var lamp = document.getElementById('lamp');
    var dot = document.getElementById('cursorDot');
    var px = innerWidth / 2, py = innerHeight / 2, lx = px, ly = py;
    window.addEventListener('mousemove', function (e) { px = e.clientX; py = e.clientY; });
    gsap.ticker.add(function () {
      lx += (px - lx) * 0.14; ly += (py - ly) * 0.14;
      lamp.style.transform = 'translate(' + lx + 'px,' + ly + 'px)';
      dot.style.transform = 'translate(' + (px - 4) + 'px,' + (py - 4) + 'px)';
    });
    document.querySelectorAll('.painting, a, button, .magnetic').forEach(function (el) {
      el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-hover'); });
    });
    var mag = document.querySelector('.magnetic');
    if (mag) {
      var qx = gsap.quickTo(mag, 'x', { duration: DUR.fast, ease: 'power2.out' });
      var qy = gsap.quickTo(mag, 'y', { duration: DUR.fast, ease: 'power2.out' });
      window.addEventListener('mousemove', function (e) {
        var r = mag.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < 180) { qx(dx * 0.25); qy(dy * 0.25); }
        else { qx(0); qy(0); }
      });
    }
  }

  /* ————— Flight route: glowing trail + banking, bobbing plane ————— */
  if (window.matchMedia('(min-width: 1000px) and (hover: hover)').matches) {
    var plane = document.getElementById('plane');
    var lit = document.getElementById('rlLit');
    var setY = gsap.quickTo(plane, 'y', { duration: 0.45, ease: 'power2.out' });
    var setRot = gsap.quickTo(plane, 'rotation', { duration: 0.4, ease: 'power2.out' });
    gsap.set(plane, { rotation: 180, transformOrigin: '50% 50%' });
    /* gentle idle bob, independent of scroll */
    gsap.to(plane, { x: 5, duration: 1.7, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    ScrollTrigger.create({
      trigger: '#main', start: 'top top', end: 'bottom bottom',
      onUpdate: function (self) {
        var p = self.progress;
        setY(10 + p * (window.innerHeight - 56));
        /* trail lights up behind the plane */
        lit.style.strokeDashoffset = String(100 - p * 100);
        /* bank into the direction of travel */
        var v = gsap.utils.clamp(-40, 40, self.getVelocity() / -60);
        setRot(180 + v);
      }
    });

    gsap.utils.toArray('.stamp').forEach(function (s) {
      gsap.from(s, {
        scale: 1.5, opacity: 0, rotate: 7, duration: DUR.base, ease: 'back.out(2)',
        scrollTrigger: { trigger: s, start: 'top 80%' }
      });
    });
  }

  /* ————— Pinned intro (the only pin on the page) ————— */
  var introTl = gsap.timeline({
    scrollTrigger: { trigger: '#intro', start: 'top top', end: '+=1500', pin: true, scrub: 1 }
  });
  gsap.utils.toArray('.intro-line').forEach(function (line, i) {
    introTl.to(line, { opacity: 1, y: 0, duration: 1 }, i * 0.9);
    if (i < 3) introTl.to(line, { opacity: 0.25, duration: 0.6 }, i * 0.9 + 1.5);
  });

  /* ————— Chapter heads ————— */
  gsap.utils.toArray('.ch-head').forEach(function (head) {
    gsap.to(head, {
      opacity: 1, y: 0, duration: DUR.slow,
      scrollTrigger: { trigger: head, start: 'top 82%' }
    });
  });

  /* ————— Painting reveals: curtain + settle + caption ————— */
  gsap.utils.toArray('.painting').forEach(function (p) {
    var veil = p.querySelector('.veil');
    var img = p.querySelector('img');
    var cap = p.querySelector('figcaption');
    var tl = gsap.timeline({
      scrollTrigger: { trigger: p, start: 'top 84%' }
    });
    tl.to(veil, { scaleY: 0, duration: 1.0, ease: 'power4.inOut' })
      .from(img, { scale: 1.12, duration: 1.4, ease: 'power2.out' }, '<')
      .to(cap, { opacity: 1, y: 0, duration: DUR.base }, '-=0.7');
  });

  /* slow breathing while on screen */
  gsap.utils.toArray('.painting img').forEach(function (img) {
    gsap.fromTo(img, { scale: 1.0 }, {
      scale: 1.04, ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* sky lines */
  gsap.utils.toArray('.sky-line').forEach(function (s) {
    gsap.from(s, {
      opacity: 0, y: 60, duration: DUR.slow,
      scrollTrigger: { trigger: s, start: 'top 72%' }
    });
  });

  initLightbox(lenis);

  /* ————— Lightbox ————— */
  function initLightbox(lenisRef) {
    var box = document.getElementById('lightbox');
    var img = document.getElementById('lbImg');
    var cn = document.getElementById('lbCn');
    var en = document.getElementById('lbEn');
    var loc = document.getElementById('lbLoc');
    var desc = document.getElementById('lbDesc');
    var items = Array.prototype.slice.call(document.querySelectorAll('.painting'));
    var idx = -1;

    function show(i) {
      idx = (i + items.length) % items.length;
      var p = items[idx];
      img.src = p.getAttribute('data-full');
      img.alt = p.getAttribute('data-cn') + ' — 刘彤油画';
      cn.textContent = p.getAttribute('data-cn');
      en.textContent = p.getAttribute('data-en');
      loc.textContent = p.getAttribute('data-loc');
      desc.textContent = p.getAttribute('data-desc');
      box.querySelector('.lb-scroll').scrollTop = 0;
    }
    function open(i) {
      show(i);
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lenisRef) lenisRef.stop();
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.fromTo('#lbImg', { scale: 0.93, y: 30, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
        gsap.fromTo('.lb-cap', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, delay: 0.15, ease: 'power3.out' });
      }
    }
    function close() {
      box.hidden = true;
      document.body.style.overflow = '';
      if (lenisRef) lenisRef.start();
    }

    items.forEach(function (p, i) {
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'button');
      p.setAttribute('aria-label', '查看《' + p.getAttribute('data-cn') + '》');
      p.addEventListener('click', function () { open(i); });
      p.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });
    document.getElementById('lbClose').addEventListener('click', close);
    document.getElementById('lbPrev').addEventListener('click', function () { show(idx - 1); });
    document.getElementById('lbNext').addEventListener('click', function () { show(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box || e.target.classList.contains('lb-scroll')) close(); });
    window.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    var sx = 0;
    box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

})();
