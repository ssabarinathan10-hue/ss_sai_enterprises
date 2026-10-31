/**
 * SS SAI ENTERPRISES — Welcome Intro Controller
 * frontend/js/welcome.js
 *
 * Manages the full cinematic welcome sequence:
 *   brand intro → saree slideshow → final CTA screen
 *
 * Called by welcome.html. Reads customer name from
 * localStorage (saree_user) set by the existing auth system.
 */

(function () {
  'use strict';

  /* ── Configuration ──────────────────────────────────────── */
  const SLIDE_VISIBLE_MS = 2600;   // how long each slide is shown
  const FADE_MS          =  800;   // crossfade duration
  const BRAND_INTRO_MS   = 2600;   // brand-intro screen hold time
  const PROGRESS_TOTAL   = (SLIDE_VISIBLE_MS + FADE_MS) * 5; // approx total

  const SLIDES = [
    {
      src:     '/images/saree_slide_1.jpg',
      caption: 'Where Tradition Meets Elegance',
      label:   '01 / 04'
    },
    {
      src:     '/images/saree_slide_2.jpg',
      caption: 'The Beauty of Timeless Silk',
      label:   '02 / 04'
    },
    {
      src:     '/images/saree_slide_3.jpg',
      caption: 'Tradition in Every Thread',
      label:   '03 / 04'
    },
    {
      src:     '/images/saree_slide_4.jpg',
      caption: 'Elegance for Every Occasion',
      label:   '04 / 04'
    },
    /* Slide 5 reuses the first image with a different caption */
    {
      src:     '/images/saree_slide_1.jpg',
      caption: 'Celebrate Your Special Moments',
      label:   ''
    }
  ];

  /* ── State ──────────────────────────────────────────────── */
  let currentSlide = 0;
  let slideTimer   = null;
  let progTimer    = null;
  let progStart    = null;
  let finished     = false;

  /* ── DOM refs ───────────────────────────────────────────── */
  const screen     = document.getElementById('welcome-screen');
  const brandIntro = document.getElementById('ws-brand-intro');
  const slidesEl   = document.getElementById('ws-slides');
  const overlay    = document.getElementById('ws-overlay');
  const captionEl  = document.getElementById('ws-caption');
  const labelEl    = document.getElementById('ws-slide-label');
  const dotsEl     = document.getElementById('ws-dots');
  const finalEl    = document.getElementById('ws-final');
  const progressEl = document.getElementById('ws-progress-bar');
  const skipBtn    = document.getElementById('ws-skip');
  const exploreBtn = document.getElementById('ws-explore-btn');
  const greetingEl = document.getElementById('ws-greeting-name');

  /* ── Personalised greeting ──────────────────────────────── */
  try {
    const user = JSON.parse(localStorage.getItem('saree_user') || 'null');
    if (user && user.name && greetingEl) {
      const first = user.name.split(' ')[0];
      greetingEl.textContent = `Welcome, ${first}`;
    }
  } catch (_) {}

  /* ── Preload images ─────────────────────────────────────── */
  SLIDES.forEach((slide, i) => {
    const img = new Image();
    img.src = slide.src;
    if (i === 0) img.fetchPriority = 'high';
  });

  /* ── Build slide elements ───────────────────────────────── */
  const slideEls = SLIDES.map((slide, i) => {
    const div = document.createElement('div');
    div.className = 'ws-slide';
    div.setAttribute('aria-hidden', 'true');

    const img = document.createElement('img');
    img.src   = slide.src;
    img.alt   = slide.caption;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.onerror = function () {
      // Gracefully replace broken image with a maroon gradient
      this.parentElement.style.background =
        'linear-gradient(135deg, #2A0913 0%, #641B2E 50%, #431321 100%)';
      this.style.display = 'none';
    };

    div.appendChild(img);
    slidesEl.appendChild(div);
    return div;
  });

  /* ── Build dots ─────────────────────────────────────────── */
  const dotEls = SLIDES.slice(0, 4).map(() => { // only 4 visible dots
    const d = document.createElement('div');
    d.className = 'ws-dot';
    dotsEl.appendChild(d);
    return d;
  });

  /* ── Progress bar ───────────────────────────────────────── */
  function startProgress() {
    progStart = Date.now();
    const tick = () => {
      const elapsed = Date.now() - progStart;
      const pct = Math.min(100, (elapsed / PROGRESS_TOTAL) * 100);
      if (progressEl) progressEl.style.width = pct + '%';
      if (pct < 100 && !finished) progTimer = requestAnimationFrame(tick);
    };
    progTimer = requestAnimationFrame(tick);
  }

  function stopProgress() {
    if (progTimer) cancelAnimationFrame(progTimer);
    if (progressEl) progressEl.style.width = '100%';
  }

  /* ── Show a slide ───────────────────────────────────────── */
  function showSlide(idx) {
    if (idx >= SLIDES.length) { showFinal(); return; }

    slideEls.forEach((el, i) => {
      el.classList.toggle('active', i === idx);
      if (i === idx) {
        // Restart Ken-Burns by re-cloning img
        const img = el.querySelector('img');
        if (img) {
          const clone = img.cloneNode(true);
          clone.onerror = img.onerror;
          el.replaceChild(clone, img);
        }
      }
    });

    // Update caption with crossfade
    captionEl.classList.add('changing');
    setTimeout(() => {
      captionEl.textContent = SLIDES[idx].caption;
      if (labelEl) labelEl.textContent = SLIDES[idx].label;
      captionEl.classList.remove('changing');
    }, 500);

    // Update dots (only first 4 slides have dots)
    dotEls.forEach((d, i) => d.classList.toggle('active', i === idx));

    // Schedule next
    if (slideTimer) clearTimeout(slideTimer);
    slideTimer = setTimeout(() => showSlide(idx + 1), SLIDE_VISIBLE_MS + FADE_MS);
  }

  /* ── Show final CTA screen ──────────────────────────────── */
  function showFinal() {
    finished = true;
    stopProgress();

    // Fade out the last slide
    slideEls.forEach(el => el.classList.remove('active'));
    overlay.classList.remove('visible');

    setTimeout(() => {
      finalEl.classList.add('visible');
      finalEl.setAttribute('aria-hidden', 'false');
    }, 400);
  }

  /* ── Begin slideshow (after brand intro) ─────────────────── */
  function beginSlideshow() {
    brandIntro.classList.add('hidden');

    setTimeout(() => {
      overlay.classList.add('visible');
      showSlide(0);
      startProgress();
    }, 900);
  }

  /* ── Navigate to homepage ───────────────────────────────── */
  function goHome() {
    if (finished) return;
    finished = true;
    if (slideTimer)  clearTimeout(slideTimer);
    stopProgress();

    screen.classList.add('exiting');
    setTimeout(() => {
      window.location.href = '/';
    }, 900);
  }

  /* ── Explore button & skip ───────────────────────────────── */
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      screen.classList.add('exiting');
      setTimeout(() => { window.location.href = '/'; }, 900);
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', () => goHome());
  }

  /* ── Floating particles ──────────────────────────────────── */
  function spawnParticles() {
    const container = screen;
    const count = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 12;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'ws-particle';
      const size = Math.random() * 4 + 2;
      p.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${Math.random() * 100}%`,
        `bottom:${Math.random() * 30}%`,
        `animation-duration:${4 + Math.random() * 6}s`,
        `animation-delay:${Math.random() * 5}s`,
        `opacity:0`
      ].join(';');
      container.appendChild(p);
    }
  }

  /* ── Auto-advance if user is idle too long ───────────────── */
  const MAX_TOTAL_MS = 14000;
  setTimeout(() => { if (!finished) showFinal(); }, MAX_TOTAL_MS);

  /* ── Keyboard: Escape to skip ───────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !finished) goHome();
  });

  /* ── Init ────────────────────────────────────────────────── */
  spawnParticles();

  // Hold brand intro, then begin slideshow
  setTimeout(beginSlideshow, BRAND_INTRO_MS);

})();
