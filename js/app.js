/* ============================================================
   studio-namma-clone — motion layer
   All choreography re-implemented from observed behavior
   (recon specs in scratchpad/recon). Original code.
   ============================================================ */

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

CustomEase.create('mainOut', '0.6, 0, 0.15, 1');

/* ---------- Lenis (the live site's active scroll driver) ---------- */
let lenis = null;
if (!prefersReduced) {
  lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function lockScroll(lock) {
  if (lenis) lock ? lenis.stop() : lenis.start();
  document.body.style.overflow = lock ? 'hidden' : '';
}

/* ---------- theme (html.data-theme + localStorage, like ref's is-dark) ---------- */
function initTheme() {
  const apply = (label) => {
    document.querySelectorAll('#modeSwitch .text-mono').forEach((el) => (el.textContent = label));
  };
  const setTheme = (dark) => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('sc-theme', dark ? 'dark' : 'light');
    apply(dark ? 'Light mode' : 'Dark mode');
  };
  apply(document.documentElement.dataset.theme === 'dark' ? 'Light mode' : 'Dark mode');
  const toggle = () => setTheme(document.documentElement.dataset.theme !== 'dark');
  document.getElementById('modeSwitch')?.addEventListener('click', toggle);
  document.getElementById('modeSwitch2')?.addEventListener('click', toggle);
}

/* ---------- city ticker + live clocks (pixel font, HH:MM:SS) ---------- */
function initCities() {
  const wrappers = [...document.querySelectorAll('.city_wrapper')];
  if (!wrappers.length) return;
  const tick = () => {
    wrappers.forEach((w) => {
      const tz = w.querySelector('.city_time')?.dataset.tz;
      if (!tz) return;
      w.querySelector('.city_time').textContent = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: tz,
      }).format(new Date());
    });
  };
  tick();
  setInterval(tick, 1000);
  // one row visible at a time, rotating every 4s
  let idx = 0;
  const list = document.querySelector('.cities_list');
  setInterval(() => {
    idx = (idx + 1) % wrappers.length;
    gsap.to(list, { y: -idx * 16, duration: 0.7, ease: 'mainOut' });
  }, 4000);
}

/* ---------- custom cursor (blue dot + labels) ---------- */
function initCursor() {
  if (isTouch) return;
  const cursor = document.querySelector('.custom-cursor');
  const label = cursor.querySelector('.custom-cursor_label');
  cursor.style.opacity = '0'; // hidden until the pointer actually moves
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });
  window.addEventListener('mousemove', (e) => {
    cursor.style.opacity = '1';
    xTo(e.clientX); yTo(e.clientY);
  });
  document.querySelectorAll('[data-cursor-hover]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      label.textContent = el.dataset.cursorHover;
      cursor.classList.add('has-label');
    });
    el.addEventListener('mouseleave', () => cursor.classList.remove('has-label'));
  });
}

/* ---------- preloader: Osmo Number Loader in 3 Steps, then reveal ----------
   Resource kept verbatim except: timeline-scoped defaults (the original uses
   global gsap.defaults, which would leak ease/duration onto every later tween),
   and an appended reveal tween that hands control back to the boot flow. */
function initPreloader(onDone) {
  const loader = document.querySelector('.loading-container');
  if (!loader || prefersReduced) { loader?.classList.add('is-done'); onDone(); return; }
  lockScroll(true);

  const tl = gsap.timeline({ defaults: { ease: 'expo.inOut', duration: 1.2 } });

  const r1 = gsap.utils.random([2, 3, 4]);
  const r2 = gsap.utils.random([5, 6]);
  const r3 = gsap.utils.random([1, 5]);
  const r4 = gsap.utils.random([7, 8, 9]);

  tl.set('.loading-screen', { display: 'block' });
  tl.set('.loading__progress-inner', { scaleY: 0 });
  tl.set('.loading__number-group.is--first .loading__number-wrap, .loading__percentage', { yPercent: 100 });
  tl.set('.loading__number-group.is--second .loading__number-wrap, .loading__number-group.is--third .loading__number-wrap', { yPercent: 10 });

  tl.to('.loading__progress-inner', { scaleY: (r1 + '' + r3) / 100 });
  tl.to('.loading__percentage', { yPercent: 0 }, '<');
  tl.to('.loading__number-group.is--second .loading__number-wrap', { yPercent: (r1 - 1) * -10 }, '<');
  tl.to('.loading__number-group.is--third .loading__number-wrap', { yPercent: (r3 - 1) * -10 }, '<');

  tl.to('.loading__progress-inner', { scaleY: (r2 + '' + r4) / 100 });
  tl.to('.loading__number-group.is--second .loading__number-wrap', { yPercent: (r2 - 1) * -10 }, '<');
  tl.to('.loading__number-group.is--third .loading__number-wrap', { yPercent: (r4 - 1) * -10 }, '<');

  tl.to('.loading__progress-inner', { scaleY: 1 });
  tl.to('.loading__number-group.is--second .loading__number-wrap', { yPercent: -90 }, '<');
  tl.to('.loading__number-group.is--third .loading__number-wrap', { yPercent: -90 }, '<');
  tl.to('.loading__number-group.is--first .loading__number-wrap', { yPercent: 0 }, '<');

  tl.to(loader, {
    yPercent: -100,
    duration: 0.9,
    ease: 'mainOut',
    onComplete: () => {
      loader.classList.add('is-done');
      loader.style.transform = '';
      lockScroll(false);
      onDone();
    },
  }, '+=0.25');
}

/* ---------- hero: char-split intro (animated-word > animated-char) ---------- */
function initHeroIntro() {
  const h1 = document.querySelector('.h1-english h1');
  if (!h1) return;
  if (prefersReduced) return;
  const split = new SplitText(h1, {
    type: 'words,chars',
    wordsClass: 'animated-word',
    charsClass: 'animated-char',
  });
  gsap.set(h1.closest('.heading-appear'), { overflow: 'hidden' });
  gsap.from(split.chars, {
    yPercent: 110,
    duration: 0.9,
    ease: 'mainOut',
    stagger: { each: 0.018, from: 'start' },
    delay: 0.1,
  });
}

/* ---------- moving visual: 3D mouse follow with lag ---------- */
function initMovingVisual() {
  if (isTouch || prefersReduced) return;
  const wrap = document.querySelector('.moving-visual_wrapper');
  if (!wrap) return;
  const hero = document.querySelector('.section_hero');
  // rest position matches the reference's settled intro spot (left-of-center, low)
  gsap.set(wrap, { x: -0.225 * window.innerWidth, y: 0.44 * window.innerHeight });
  const xTo = gsap.quickTo(wrap, 'x', { duration: 0.9, ease: 'power3.out' });
  const yTo = gsap.quickTo(wrap, 'y', { duration: 0.9, ease: 'power3.out' });
  const rxTo = gsap.quickTo(wrap, 'rotationY', { duration: 0.9, ease: 'power3.out' });
  const ryTo = gsap.quickTo(wrap, 'rotationX', { duration: 0.9, ease: 'power3.out' });
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    xTo(nx * r.width * 0.62);
    yTo(ny * r.height * 0.9);
    rxTo(nx * 8);
    ryTo(-ny * 8);
  });
}

/* ---------- scroll reveals (observed vocabulary) ---------- */
function initReveals() {
  if (prefersReduced) return;

  // grow-appear: scale .9 → 1 + fade (home video, footer tiles)
  document.querySelectorAll('.grow-appear, .visual_wrapper.is-home-video').forEach((el) => {
    gsap.fromTo(el, { scale: 0.9, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 1.2, ease: 'mainOut',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // line-appear: line-mask reveal (cta h2, services items)
  document.querySelectorAll('.line-appear').forEach((el) => {
    const split = new SplitText(el, { type: 'lines', linesClass: 'animated-line', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 110, duration: 1, ease: 'mainOut', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // heading-appear on scroll (playground heading)
  document.querySelectorAll('.section_latest .heading-appear p').forEach((el) => {
    const split = new SplitText(el, { type: 'words,chars', wordsClass: 'animated-word', charsClass: 'animated-char' });
    gsap.set(el.closest('.heading-appear'), { overflow: 'hidden' });
    gsap.from(split.chars, {
      yPercent: 110, duration: 0.8, ease: 'mainOut', stagger: 0.02,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // text-appear / mono-appear / simple-appear: soft rise + fade (page content only, not fixed chrome)
  document.querySelectorAll('#smooth-content :is(.text-appear, .mono-appear, .simple-appear, .element-appear, .text-mono_wrapper)').forEach((el) => {
    gsap.fromTo(el, { y: 24, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: 'mainOut',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  // latest cards: gentle fade in (no movement — left-to-center fly-in removed)
  document.querySelectorAll('.latest_content_item').forEach((item) => {
    const visual = item.querySelector('.latest_visual');
    gsap.fromTo(visual,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 92%', once: true },
      });
  });

  // services rows (desktop): light up on enter and stay lit; the row crossing
  // viewport center is "current" and shows its preview card + side label
  if (window.innerWidth > 767) {
    document.querySelectorAll('.home_services_list-item_wrapper').forEach((row) => {
      ScrollTrigger.create({
        trigger: row,
        start: 'top 75%',
        once: true,
        onEnter: () => row.classList.add('is-active'),
      });
      ScrollTrigger.create({
        trigger: row,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => row.classList.toggle('is-current', self.isActive),
      });
    });
  }

  // footer logo: rise + stretch settle
  const logo = document.querySelector('.footer_logo_stretch');
  if (logo) {
    gsap.fromTo(logo, { scaleY: 0.2, transformOrigin: 'bottom' }, {
      scaleY: 1, duration: 1.2, ease: 'mainOut',
      scrollTrigger: { trigger: '.footer_logo_wrapper', start: 'top 92%', once: true },
    });
  }
}

/* ---------- intro manifesto hover: image cluster pop ---------- */
function initIntroHovers() {
  if (isTouch) return;
  const images = [...document.querySelectorAll('.home_intro_image')];
  const section = document.querySelector('.home_intro_component');
  if (!images.length) return;
  // pre-place clusters around the paragraph
  const spots = [
    { x: -34, y: -30 }, { x: 26, y: -36 }, { x: -20, y: 18 }, { x: 34, y: 26 }, { x: -38, y: 34 },
    { x: 30, y: -12 }, { x: -26, y: -8 }, { x: 18, y: 34 }, { x: -12, y: -38 }, { x: 12, y: 10 }, { x: 38, y: 2 },
  ];
  images.forEach((img, i) => {
    const s = spots[i % spots.length];
    gsap.set(img, {
      width: '11rem', height: '8rem',
      left: `calc(50% + ${s.x}vw * 0.45)`,
      top: `calc(50% + ${s.y}vh * 0.45)`,
      xPercent: -50, yPercent: -50,
      opacity: 0, scale: 0.6, rotation: (i % 2 ? 6 : -6),
    });
  });
  document.querySelectorAll('.home_intro_hover').forEach((span) => {
    const group = span.dataset.visualGroup;
    const set = images.filter((img) => img.dataset.group === group);
    span.addEventListener('mouseenter', () => {
      gsap.to(set, { opacity: 1, scale: 1, duration: 0.45, ease: 'mainOut', stagger: 0.05 });
    });
    span.addEventListener('mouseleave', () => {
      gsap.to(set, { opacity: 0, scale: 0.6, duration: 0.35, ease: 'power2.in', stagger: 0.03 });
    });
  });
}

/* ---------- menu overlay: skewed clip reveal + link stagger ---------- */
function initMenu() {
  const menu = document.querySelector('.nav-menu');
  const toggle = document.getElementById('menuToggle');
  const links = menu.querySelectorAll('.nav-menu_link_wrapper');
  const labelEls = toggle.querySelectorAll('.text-mono');
  let open = false;
  let tl = null;

  const setLabel = (t) => labelEls.forEach((el) => (el.textContent = t));

  function openMenu() {
    tl?.kill();
    menu.classList.add('is-open');
    lockScroll(true);
    setLabel('Close');
    tl = gsap.timeline();
    tl.fromTo(menu,
      { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' },
      { clipPath: 'polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)', duration: 1.1, ease: 'mainOut' }, 0)
      .fromTo(links, { y: 387 }, { y: 0, duration: 1.1, ease: 'mainOut', stagger: 0.045 }, 0.05);
  }
  function closeMenu() {
    tl?.kill();
    setLabel('Menu');
    tl = gsap.timeline({
      onComplete: () => { menu.classList.remove('is-open'); lockScroll(false); },
    });
    tl.to(menu, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', duration: 0.7, ease: 'mainOut' }, 0)
      .to(links, { y: 120, duration: 0.7, ease: 'mainOut' }, 0);
  }
  toggle.addEventListener('click', () => { open = !open; open ? openMenu() : closeMenu(); });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    open = false; closeMenu();
  }));
}

/* ---------- contact overlay: slide down over dark veil ---------- */
function initContact() {
  const panel = document.querySelector('.section_contact');
  const veil = document.querySelector('.contact_overlay');
  const openers = ['openContact', 'openContact2', 'openForm'].map((id) => document.getElementById(id)).filter(Boolean);
  const closers = ['closeForm', 'closeForm2'].map((id) => document.getElementById(id)).filter(Boolean);

  function openPanel() {
    panel.classList.add('is-open');
    lockScroll(true);
    gsap.set(veil, { visibility: 'visible' });
    gsap.to(veil, { opacity: 0.55, duration: 0.6, ease: 'power2.out' });
    gsap.fromTo(panel, { yPercent: -100 }, { yPercent: 0, duration: 1, ease: 'mainOut' });
  }
  function closePanel() {
    gsap.to(veil, { opacity: 0, duration: 0.6, ease: 'power2.in', onComplete: () => gsap.set(veil, { visibility: 'hidden' }) });
    gsap.to(panel, {
      yPercent: -100, duration: 0.8, ease: 'mainOut',
      onComplete: () => { panel.classList.remove('is-open'); lockScroll(false); },
    });
  }
  openers.forEach((el) => el.addEventListener('click', openPanel));
  closers.forEach((el) => el.addEventListener('click', closePanel));
}

/* ---------- cookie banner ---------- */
function initCookie() {
  const cookie = document.getElementById('cookie');
  if (localStorage.getItem('sc-cookie') === 'accepted') return;
  setTimeout(() => cookie.classList.add('is-visible'), 2600);
  document.getElementById('acceptCookie').addEventListener('click', () => {
    cookie.classList.remove('is-visible');
    localStorage.setItem('sc-cookie', 'accepted');
  });
}

/* ---------- boot ---------- */
document.fonts.ready.then(() => {
  initTheme();
  initCities();
  initCursor();
  initMenu();
  initContact();
  initCookie();
  initMovingVisual();
  initIntroHovers();
  initPreloader(() => {
    initHeroIntro();
    initReveals();
    ScrollTrigger.refresh();
  });
});
window.addEventListener('load', () => ScrollTrigger.refresh());
