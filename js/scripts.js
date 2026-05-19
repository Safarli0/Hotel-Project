
/* 1. DARK MODE */
(function initDarkMode() {
  const toggle = document.getElementById('darkModeToggle');
  const STORAGE_KEY = 'deluxe_dark';

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'true') {
    document.body.classList.add('dark-mode');
    if (toggle) toggle.textContent = '☀️';
  }

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    toggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem(STORAGE_KEY, isDark);

    const flash = document.createElement('div');
    flash.style.cssText =
      'position:fixed;inset:0;background:' +
      (isDark ? '#000' : '#fff') +
      ';opacity:.18;pointer-events:none;z-index:9999;transition:opacity .4s';
    document.body.appendChild(flash);
    requestAnimationFrame(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 500);
    });
  });
})();


/* 2. STICKY NAVBAR + HIDE-ON-SCROLL */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;

        if (y > 80) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        if (y > lastY && y > 200) {
          navbar.classList.add('nav-hidden');
        } else {
          navbar.classList.remove('nav-hidden');
        }

        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  });
})();


/* 3. SMOOTH SCROLL FOR ALL ANCHOR LINKS */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* 4. ACTIVE NAV LINK ON SCROLL (Intersection Observer) */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle(
              'active-link',
              link.getAttribute('href') === '#' + entry.target.id
            );
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(s => observer.observe(s));
})();


/* 5. SCROLL-REVEAL ANIMATIONS */
(function initScrollReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .sr-hidden { opacity: 0; transform: translateY(42px); transition: opacity .65s ease, transform .65s ease; }
    .sr-visible { opacity: 1 !important; transform: translateY(0) !important; }
    .sr-left  { opacity: 0; transform: translateX(-50px); transition: opacity .65s ease, transform .65s ease; }
    .sr-right { opacity: 0; transform: translateX(50px);  transition: opacity .65s ease, transform .65s ease; }
  `;
  document.head.appendChild(style);

  const candidates = document.querySelectorAll(
    '.card, .flex-items > div, .column-2, .column-1, .section-header, .teams > .flex-items > div'
  );

  candidates.forEach((el, i) => {
    const dir = i % 3 === 1 ? 'sr-left' : i % 3 === 2 ? 'sr-right' : 'sr-hidden';
    el.classList.add(dir);
    el.style.transitionDelay = (i % 4) * 0.13 + 's';
  });

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sr-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  candidates.forEach(el => revealObserver.observe(el));
})();


/* 6. IMAGE CAROUSEL (Gallery) ──────────────────────────── */
(function initCarousel() {
  const slidesWrapper = document.querySelector('.slides');
  if (!slidesWrapper) return;

  const slides = slidesWrapper.querySelectorAll('.slide');
  let current = 0;
  let autoTimer;
  const total = slides.length;

  const carousel = document.querySelector('.gallery-carousel');

  const prevBtn = document.createElement('button');
  prevBtn.className = 'nav-btn prev-btn';
  prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'nav-btn next-btn';
  nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'dots';

  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);
  });

  carousel.appendChild(prevBtn);
  carousel.appendChild(nextBtn);
  carousel.appendChild(dotsContainer);

  function goTo(index) {
    slides[current].classList.remove('active-slide');
    dotsContainer.children[current].classList.remove('active');
    current = (index + total) % total;
    slides[current].classList.add('active-slide');
    dotsContainer.children[current].classList.add('active');
    slidesWrapper.style.transform = `translateX(-${current * 100}%)`;
  }


  slides[0].classList.add('active-slide');

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  dotsContainer.addEventListener('click', e => {
    if (e.target.classList.contains('dot')) {
      goTo(+e.target.dataset.index);
      resetAuto();
    }
  });

  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) goTo(delta > 0 ? current + 1 : current - 1);
    resetAuto();
  });

  /* Keyboard */
  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 3800); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  startAuto();
})();


/* 7. PARALLAX HERO */
(function initParallax() {
  const hero = document.querySelector('.main-header');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    hero.style.backgroundPositionY = `calc(50% + ${y * 0.4}px)`;
  }, { passive: true });
})();


/* 8. ROOM CARD TILT EFFECT */
(function initCardTilt() {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -8;
      const rotY = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
      card.style.transition = 'transform .05s';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .4s ease';
    });
  });
})();


/* 9. CONTACT FORM VALIDATION */
(function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .form-control input.error { border: 2px solid #e74c3c; }
    .form-control input.ok    { border: 2px solid #2ecc71; }
    .field-msg { font-size: .78rem; margin-top: 3px; }
    .field-msg.err { color: #e74c3c; }
    .field-msg.ok  { color: #2ecc71; }
    .toast-msg { position:fixed; bottom:28px; right:28px; background:#222; color:#fff;
      padding:14px 24px; border-radius:8px; font-size:.95rem; opacity:0;
      transform:translateY(16px); transition:all .35s; z-index:9999; pointer-events:none; }
    .toast-msg.show { opacity:1; transform:translateY(0); }
  `;
  document.head.appendChild(styleEl);

  function showMsg(input, msg, type) {
    let el = input.parentElement.querySelector('.field-msg');
    if (!el) { el = document.createElement('p'); el.className = 'field-msg'; input.parentElement.appendChild(el); }
    el.textContent = msg;
    el.className = 'field-msg ' + type;
    input.className = type === 'err' ? 'error' : 'ok';
  }

  function toast(msg) {
    let t = document.querySelector('.toast-msg');
    if (!t) { t = document.createElement('div'); t.className = 'toast-msg'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
  }

  function validate(input) {
    const val = input.value.trim();
    if (input.type === 'email') {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      showMsg(input, ok ? '✓ Looks good!' : 'Please enter a valid email.', ok ? 'ok' : 'err');
      return ok;
    }
    if (input.id === 'phone') {
      const ok = /^\+?[\d\s\-()]{7,}$/.test(val);
      showMsg(input, ok ? '✓ Looks good!' : 'Enter a valid phone number.', ok ? 'ok' : 'err');
      return ok;
    }
    if (val.length < 2) {
      showMsg(input, 'This field is required.', 'err'); return false;
    }
    showMsg(input, '✓ Looks good!', 'ok');
    return true;
  }

  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', () => validate(input));
    input.addEventListener('input', () => validate(input));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll('input')];
    const allOk = inputs.every(validate);
    if (allOk) {
      toast('✅ Message sent! We will get back to you soon.');
      form.reset();
      inputs.forEach(i => { i.className = ''; const m = i.parentElement.querySelector('.field-msg'); if (m) m.textContent = ''; });
    } else {
      toast('⚠️ Please fix the errors above.');
    }
  });
})();

/*11. COUNTER ANIMATION (Stats / Teams section)*/
(function initCounters() {

  const teamsHeader = document.querySelector('#teams .section-header');
  if (!teamsHeader) return;

  const countersHTML = `
    <div class="counters" style="display:flex;gap:40px;justify-content:center;margin-top:24px;flex-wrap:wrap;">
      <div class="counter-item" style="text-align:center;">
        <span class="counter-num" data-target="12">0</span>
        <span style="font-size:1.8rem;font-weight:700;color:var(--primary,#c9a84c)">+</span>
        <p style="margin:4px 0 0;font-size:.88rem;opacity:.7;letter-spacing:1px;text-transform:uppercase">Years Experience</p>
      </div>
      <div class="counter-item" style="text-align:center;">
        <span class="counter-num" data-target="350">0</span>
        <span style="font-size:1.8rem;font-weight:700;color:var(--primary,#c9a84c)">+</span>
        <p style="margin:4px 0 0;font-size:.88rem;opacity:.7;letter-spacing:1px;text-transform:uppercase">Rooms</p>
      </div>
      <div class="counter-item" style="text-align:center;">
        <span class="counter-num" data-target="5800">0</span>
        <span style="font-size:1.8rem;font-weight:700;color:var(--primary,#c9a84c)">+</span>
        <p style="margin:4px 0 0;font-size:.88rem;opacity:.7;letter-spacing:1px;text-transform:uppercase">Happy Guests</p>
      </div>
      <div class="counter-item" style="text-align:center;">
        <span class="counter-num" data-target="48">0</span>
        <span style="font-size:1.8rem;font-weight:700;color:var(--primary,#c9a84c)">+</span>
        <p style="margin:4px 0 0;font-size:.88rem;opacity:.7;letter-spacing:1px;text-transform:uppercase">Awards</p>
      </div>
    </div>`;

  teamsHeader.insertAdjacentHTML('beforeend', countersHTML);

  const counterStyle = document.createElement('style');
  counterStyle.textContent = `.counter-num { font-size: 2.4rem; font-weight: 800; color: var(--primary,#c9a84c); }`;
  document.head.appendChild(counterStyle);

  function animateCounter(el) {
    const target = +el.dataset.target;
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) { el.textContent = target.toLocaleString(); clearInterval(timer); return; }
      el.textContent = Math.floor(current).toLocaleString();
    }, 16);
  }

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.counter-num').forEach(animateCounter);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  const countersEl = teamsHeader.querySelector('.counters');
  if (countersEl) counterObserver.observe(countersEl);
})();


/*12. BACK-TO-TOP BUTTON*/
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  document.body.appendChild(btn);

  const s = document.createElement('style');
  s.textContent = `
    #back-to-top {
      position: fixed; bottom: 32px; left: 32px; width: 44px; height: 44px;
      border-radius: 50%; border: none; background: var(--primary, #c9a84c);
      color: #fff; font-size: 1rem; cursor: pointer;
      opacity: 0; transform: translateY(20px); transition: opacity .3s, transform .3s;
      z-index: 8888; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,.22);
    }
    #back-to-top.visible { opacity: 1; transform: translateY(0); }
    #back-to-top:hover   { filter: brightness(1.15); transform: translateY(-3px); }
  `;
  document.head.appendChild(s);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/*13. LAZY LOADING IMAGES  */
(function initLazyLoad() {
  const imgs = document.querySelectorAll('img');
  if ('loading' in HTMLImageElement.prototype) {
    imgs.forEach(img => { img.loading = 'lazy'; });
    return;
  }
  const lazyObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        lazyObs.unobserve(img);
      }
    });
  });
  imgs.forEach(img => lazyObs.observe(img));
})();


/* 14. TYPING HERO TEXT */
(function initTypingEffect() {
  const heroP = document.querySelector('.main-header .content p');
  if (!heroP) return;

  const phrases = [
    'Experience luxury like never before.',
    'Your perfect getaway awaits.',
    'Where comfort meets elegance.',
    'Unforgettable moments start here.',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let paused = false;

  heroP.style.borderRight = '2px solid rgba(255,255,255,.7)';
  heroP.style.whiteSpace = 'nowrap';
  heroP.style.overflow = 'hidden';
  heroP.style.display = 'inline-block';

  function tick() {
    if (paused) return;
    const phrase = phrases[phraseIdx];

    if (deleting) {
      heroP.textContent = phrase.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        paused = true;
        setTimeout(() => { paused = false; tick(); }, 500);
        return;
      }
      setTimeout(tick, 40);
    } else {
      heroP.textContent = phrase.slice(0, ++charIdx);
      if (charIdx === phrase.length) {
        paused = true;
        setTimeout(() => { deleting = true; paused = false; tick(); }, 1800);
        return;
      }
      setTimeout(tick, 75);
    }
  }

  tick();
})();


/*15. MOBILE HAMBURGER MENU */
(function initHamburger() {
  const navbar = document.querySelector('.navbar');
  const nav    = document.querySelector('.navbar nav');
  if (!navbar || !nav) return;

  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.setAttribute('aria-label', 'Toggle menu');
  hamburger.innerHTML = `<span></span><span></span><span></span>`;
  navbar.appendChild(hamburger);

  const hStyle = document.createElement('style');
  hStyle.textContent = `
    .hamburger { display:none; flex-direction:column; gap:5px; background:none;
      border:none; cursor:pointer; padding:4px; }
    .hamburger span { display:block; width:26px; height:2px; background:#fff;
      border-radius:2px; transition:transform .3s, opacity .3s; }
    .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity:0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    @media(max-width:768px) {
      .hamburger { display:flex; }
      .navbar nav { position:absolute; top:100%; left:0; right:0;
        background:rgba(20,20,20,.97); padding:0; max-height:0; overflow:hidden;
        transition:max-height .4s ease, padding .3s; }
      .navbar nav.open { max-height:320px; padding:12px 0; }
      .navbar nav ul { flex-direction:column; gap:0; }
      .navbar nav ul li, .navbar nav ul a { display:block; padding:12px 28px; }
      .navbar { position:relative; }
    }
  `;
  document.head.appendChild(hStyle);

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      nav.classList.remove('open');
    });
  });
})();


/*16. DARK MODE CSS INJECTION */
(function injectDarkModeStyles() {
  const s = document.createElement('style');
  s.textContent = `
    body.dark-mode { background: #121212 !important; color: #e0e0e0 !important; }
    body.dark-mode .bg-light  { background: #1e1e1e !important; }
    body.dark-mode .bg-secondary { background: #1a1a2e !important; }
    body.dark-mode .card      { background: #1e1e1e !important; }
    body.dark-mode .footer    { background: #1e1e1e !important; }
    body.dark-mode input      { background: #2a2a2a !important; color: #eee !important; border: 1px solid #444 !important; }
    body.dark-mode .column-2.bg-light { background: #1e1e1e !important; }
    body.dark-mode .navbar    { background: rgba(18,18,18,.97) !important; }
    .navbar { transition: background .35s, box-shadow .35s; }
    .navbar.scrolled { background: rgba(10,10,10,.96) !important; box-shadow: 0 2px 20px rgba(0,0,0,.35); }
    .navbar.nav-hidden { transform: translateY(-100%); transition: transform .35s ease; }
    nav a.active-link { border-bottom: 2px solid var(--primary,#c9a84c); }
  `;
  document.head.appendChild(s);
})();


/* 17. CAROUSEL CSS INJECTION */
(function injectCarouselStyles() {
  const s = document.createElement('style');
  s.textContent = `
    .gallery-carousel { position: relative; overflow: hidden; border-radius: 12px; }
    .slides-wrapper   { overflow: hidden; }
    .slides { display: flex; transition: transform .55s cubic-bezier(.77,0,.18,1); }
    .slide  { min-width: 100%; }
    .slide img { width: 100%; display: block; object-fit: cover; max-height: 520px; }
    .nav-btn {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(0,0,0,.45); color: #fff; border: none;
      padding: 12px 16px; font-size: 1.2rem; cursor: pointer;
      border-radius: 4px; transition: background .2s, transform .2s;
      z-index: 10;
    }
    .nav-btn:hover { background: rgba(0,0,0,.75); transform: translateY(-50%) scale(1.08); }
    .prev-btn { left: 12px; }
    .next-btn { right: 12px; }
    .dots { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
    .dot  { width: 10px; height: 10px; background: rgba(255,255,255,.45); border-radius: 50%; cursor: pointer; transition: background .25s, transform .25s; }
    .dot.active { background: #fff; transform: scale(1.3); }
  `;
  document.head.appendChild(s);
})();


/* 18. PAGE LOAD PROGRESS BAR */
(function initProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'progress-bar';
  document.body.prepend(bar);

  const s = document.createElement('style');
  s.textContent = `
    #progress-bar {
      position: fixed; top: 0; left: 0; height: 3px; width: 0%;
      background: linear-gradient(90deg, #c9a84c, #f5d98b);
      z-index: 100000; transition: width .2s ease;
      box-shadow: 0 0 8px #c9a84c;
    }
  `;
  document.head.appendChild(s);

  const docH = document.documentElement;

  function updateBar() {
    const scrolled = window.scrollY;
    const total    = docH.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }

  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
})();


/* 19. SECTION RIPPLE ON CLICK */
(function initRipple() {
  const s = document.createElement('style');
  s.textContent = `
    .ripple-wrap { overflow: hidden; position: relative; }
    .ripple-circle {
      position: absolute; border-radius: 50%;
      background: rgba(201,168,76,.22);
      animation: ripple-anim .7s linear forwards;
      pointer-events: none; transform: scale(0);
    }
    @keyframes ripple-anim { to { transform: scale(4); opacity: 0; } }
  `;
  document.head.appendChild(s);

  document.querySelectorAll('.btn').forEach(btn => {
    btn.classList.add('ripple-wrap');
    btn.addEventListener('click', e => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const circle = document.createElement('span');
      circle.className = 'ripple-circle';
      Object.assign(circle.style, {
        width: size + 'px', height: size + 'px',
        left:  (e.clientX - rect.left - size / 2) + 'px',
        top:   (e.clientY - rect.top  - size / 2) + 'px',
      });
      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 750);
    });
  });
})();


/* 20. WINDOW RESIZE DEBOUNCE UTILITY */
(function initResizeHandler() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    document.body.classList.add('resize-animation-stopper');
    resizeTimer = setTimeout(() => {
      document.body.classList.remove('resize-animation-stopper');
    }, 400);
  });

  const s = document.createElement('style');
  s.textContent = `.resize-animation-stopper * { animation: none !important; transition: none !important; }`;
  document.head.appendChild(s);
})();
