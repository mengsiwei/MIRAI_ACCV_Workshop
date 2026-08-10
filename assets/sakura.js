/* =========================================================
   MIRAI Driving @ ACCV 2026
   Sakura UX: falling cherry-blossom petals + nav behaviour
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. Falling petals
     --------------------------------------------------------- */
  function initSakura() {
    var canvas = document.getElementById('sakura-canvas');
    if (!canvas || reduceMotion) { if (canvas) canvas.style.display = 'none'; return; }

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var petals = [];
    var running = true;

    // Blossom tones sampled from the workshop logo.
    var TONES = [
      'rgba(247, 179, 201, ALPHA)',
      'rgba(255, 214, 228, ALPHA)',
      'rgba(239, 139, 171, ALPHA)',
      'rgba(255, 235, 242, ALPHA)'
    ];

    function petalCount() {
      if (W < 600) return 14;
      if (W < 1000) return 22;
      return 32;
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var target = petalCount();
      while (petals.length < target) petals.push(makePetal(true));
      if (petals.length > target) petals.length = target;
    }

    function rand(min, max) { return min + Math.random() * (max - min); }

    function makePetal(anywhere) {
      var size = rand(7, 16);
      return {
        x: rand(-40, W + 40),
        y: anywhere ? rand(-H, H) : rand(-80, -20),
        size: size,
        // Larger petals fall slightly faster — a gentle depth cue.
        speedY: rand(0.28, 0.85) * (size / 11),
        speedX: rand(-0.35, 0.55),
        // Horizontal sway
        swayAmp: rand(12, 42),
        swayFreq: rand(0.004, 0.012),
        swayPhase: rand(0, Math.PI * 2),
        // Tumbling: flip factor makes the petal appear to rotate in 3D
        spin: rand(-0.012, 0.012),
        angle: rand(0, Math.PI * 2),
        flipPhase: rand(0, Math.PI * 2),
        flipSpeed: rand(0.008, 0.022),
        color: TONES[(Math.random() * TONES.length) | 0].replace('ALPHA', rand(0.45, 0.85).toFixed(2))
      };
    }

    // One cherry-blossom petal: rounded body with the characteristic notched tip.
    function drawPetal(p) {
      var s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-s * 0.62, -s * 0.30, -s * 0.52, -s * 0.92, 0, -s * 1.12);
      ctx.bezierCurveTo(s * 0.52, -s * 0.92, s * 0.62, -s * 0.30, 0, 0);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();

      // Soft notch at the tip
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.12);
      ctx.quadraticCurveTo(0, -s * 0.86, 0, -s * 0.74);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = Math.max(1, s * 0.09);
      ctx.stroke();
    }

    var t = 0;
    function frame() {
      if (!running) return;
      t += 1;
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];

        p.y += p.speedY;
        p.x += p.speedX + Math.sin(t * p.swayFreq + p.swayPhase) * p.swayAmp * 0.012;
        p.angle += p.spin;
        p.flipPhase += p.flipSpeed;

        // Recycle petals that leave the viewport
        if (p.y > H + 40 || p.x < -80 || p.x > W + 80) {
          petals[i] = makePetal(false);
          continue;
        }

        var flip = Math.cos(p.flipPhase); // -1 .. 1 → edge-on when near 0
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(Math.max(0.12, Math.abs(flip)), 1);
        ctx.globalAlpha = 0.55 + Math.abs(flip) * 0.45;
        drawPetal(p);
        ctx.restore();
      }

      requestAnimationFrame(frame);
    }

    // Pause the animation when the tab is hidden to save battery.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        running = false;
      } else if (!running) {
        running = true;
        requestAnimationFrame(frame);
      }
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------
     2. Mobile navigation
     --------------------------------------------------------- */
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    var nav = document.getElementById('siteNav');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    window.addEventListener('scroll', function () {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     3. Scroll spy — highlight the section currently in view
     --------------------------------------------------------- */
  function initScrollSpy() {
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.nav-links a[href^="#"]')
    );
    if (!navLinks.length || !('IntersectionObserver' in window)) return;

    var map = {};
    var sections = [];
    navLinks.forEach(function (a) {
      var el = document.querySelector(a.getAttribute('href'));
      if (el) { map[el.id] = a; sections.push(el); }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('active'); });
          var link = map[entry.target.id];
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------------------------------------------------------
     4. Reveal content as it scrolls into view
     --------------------------------------------------------- */
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    var targets = document.querySelectorAll(
      '.section-title, .section-lead, .prose, .topic-card, .speaker-card, ' +
      '.program-card, .panel-note, .venue-box, .org-card, .timeline, .contact-cards'
    );
    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min(i * 60, 240) + 'ms';
        el.classList.add('visible');
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  function boot() {
    initSakura();
    initNav();
    initScrollSpy();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
