/* ============================================================
   VIRTUPACK — script.js
   ============================================================ */

'use strict';

// ── Footer year ──────────────────────────────────────────────
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ── Navbar scroll state ──────────────────────────────────────
(function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── Hamburger menu ───────────────────────────────────────────
(function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.classList.toggle('open');
    links.classList.toggle('open');
  });

  // Close menu on any nav link click
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('open');
      links.classList.remove('open');
    });
  });
})();

// ── Hero entrance animations ─────────────────────────────────
(function initHeroAnimations() {
  const words  = document.querySelectorAll('.tagline-word');
  const cta    = document.getElementById('hero-cta');

  // Logo fades in via CSS animation (heroLogoIn keyframe @ 200ms)
  // Words trigger after logo animation completes (~900ms)
  const BASE_DELAY = 900;

  words.forEach(word => {
    const extra = parseInt(word.dataset.delay, 10) || 0;
    setTimeout(() => word.classList.add('visible'), BASE_DELAY + extra);
  });

  // CTA appears after last word
  const lastDelay = parseInt(words[words.length - 1]?.dataset.delay ?? '0', 10);
  setTimeout(() => cta.classList.add('visible'), BASE_DELAY + lastDelay + 400);
})();

// ── Particle canvas background ───────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  let W, H, particles, animId;

  const PARTICLE_COLOR = 'rgba(77, 163, 255, ';
  const COUNT_BASE     = 55;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.4 + 0.4,
      vx:    (Math.random() - 0.5) * 0.18,
      vy:    (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.35 + 0.05,
    };
  }

  function init() {
    resize();
    const count = Math.floor(COUNT_BASE * (W / 1440));
    particles = Array.from({ length: Math.max(count, 30) }, createParticle);
  }

  function drawConnections() {
    const DIST = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < DIST) {
          const opacity = (1 - dist / DIST) * 0.06;
          ctx.strokeStyle = PARTICLE_COLOR + opacity + ')';
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = PARTICLE_COLOR + p.alpha + ')';
      ctx.fill();
    });

    drawConnections();
    animId = requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(() => {
    resize();
  });
  ro.observe(canvas.parentElement);

  init();
  tick();

  // Pause when tab hidden to save CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      tick();
    }
  });
})();

// ── Intersection Observer — scroll reveal ────────────────────
(function initScrollReveal() {
  // Generic reveal for .reveal-block elements
  const blockObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          blockObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal-block').forEach(el => blockObs.observe(el));

  // Text lines reveal one-by-one within a parent block
  const lineObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const parent = e.target;
        const lines  = parent.querySelectorAll('.reveal-line');
        lines.forEach((line, i) => {
          setTimeout(() => line.classList.add('is-visible'), i * 120);
        });
        lineObs.unobserve(parent);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  // Observe immediate parents that contain .reveal-line children
  document.querySelectorAll('.about-block, .about-closing, .contact > .container').forEach(el => {
    lineObs.observe(el);
  });

  // Staggered card fly-in
  const cardObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const grid  = e.target;
        const cards = grid.querySelectorAll('.reveal-card');
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add('is-visible'), i * 150);
        });
        cardObs.unobserve(grid);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  const cardsGrid = document.getElementById('cards-grid');
  if (cardsGrid) cardObs.observe(cardsGrid);

  // Contact form fields slide up sequentially
  const formObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const fields = e.target.querySelectorAll('.reveal-field');
        fields.forEach((field, i) => {
          setTimeout(() => field.classList.add('is-visible'), i * 100);
        });
        formObs.unobserve(e.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
  );

  const form = document.getElementById('contact-form');
  if (form) formObs.observe(form);
})();

// ── Contact form — basic client-side feedback ────────────────
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const submitBtn = form.querySelector('.btn-submit');
    if (!submitBtn) return;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled    = true;
  });
})();
