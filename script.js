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
// Initialised inside DOMContentLoaded so layout is stable before
// the observer measures element positions.
document.addEventListener('DOMContentLoaded', function initScrollReveal() {
  // Cards and form fields are staggered; the observer fires on the
  // container (cards-grid / contact-form) and then staggers children.
  // Everything else (.reveal-line) is observed directly.

  const THRESHOLD = 0.15;

  // ── Helper: reveal a single element immediately ──────────────
  function reveal(el) {
    el.classList.add('is-visible');
  }

  // ── 1. Observe .reveal-line elements directly ────────────────
  //    Text lines inside each about-block stagger 120ms apart
  //    within their own parent group.
  const lineObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);

        // Find sibling lines in the same parent and stagger them
        const parent = entry.target.parentElement;
        const siblings = parent
          ? Array.from(parent.querySelectorAll('.reveal-line'))
          : [entry.target];

        siblings.forEach((line, i) => {
          // Stop observing siblings so they don't double-fire
          obs.unobserve(line);
          setTimeout(() => reveal(line), i * 120);
        });
      });
    },
    { threshold: THRESHOLD }
  );

  document.querySelectorAll('.reveal-line').forEach(el => lineObserver.observe(el));

  // ── 2. Cards — observe the grid, stagger children 150ms ──────
  const cardsGrid = document.getElementById('cards-grid');
  if (cardsGrid) {
    const cardObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          const cards = entry.target.querySelectorAll('.reveal-card');
          cards.forEach((card, i) => {
            setTimeout(() => reveal(card), i * 150);
          });
        });
      },
      { threshold: THRESHOLD }
    );
    cardObserver.observe(cardsGrid);
  }

  // ── 3. Form fields — observe the form, stagger children 100ms ─
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const fieldObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          const fields = entry.target.querySelectorAll('.reveal-field');
          fields.forEach((field, i) => {
            setTimeout(() => reveal(field), i * 100);
          });
        });
      },
      { threshold: THRESHOLD }
    );
    fieldObserver.observe(contactForm);
  }
});

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
