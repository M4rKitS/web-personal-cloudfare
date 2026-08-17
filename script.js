/* =============================================
   MARCOS RODRÍGUEZ — Personal Portfolio
   script.js — v3 with i18n (EN, ES, FI)
   ============================================= */
'use strict';

// Current active language state
let currentLanguage = 'en';

// ===== INTERNATIONALIZATION (i18n) =====
function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLanguage = lang;
  localStorage.setItem('portfolio_lang', lang);
  document.documentElement.lang = lang;

  const dict = TRANSLATIONS[lang];

  // Update page title and description
  if (dict['meta.title']) document.title = dict['meta.title'];
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && dict['meta.description']) metaDesc.setAttribute('content', dict['meta.description']);

  // Update elements with text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Update elements with HTML content
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Update language buttons active state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

// Initialize language selector buttons
(function initI18n() {
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  // Load saved language or detect browser preference
  const savedLang = localStorage.getItem('portfolio_lang');
  if (savedLang && TRANSLATIONS[savedLang]) {
    setLanguage(savedLang);
  } else {
    const browserLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
    if (TRANSLATIONS[browserLang]) {
      setLanguage(browserLang);
    } else {
      setLanguage('en');
    }
  }
})();

// ===== NAVBAR =====
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-links');
  if (!navbar || !toggle || !navMenu) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ===== ACTIVE NAV ON SCROLL =====
(function initActiveNav() {
  const sections   = document.querySelectorAll('section[id]');
  const navLinks   = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 90) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
})();

// ===== PARTICLES =====
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const COUNT  = 24;
  const colors = ['rgba(255,98,0,', 'rgba(255,122,32,', 'rgba(255,61,0,'];

  for (let i = 0; i < COUNT; i++) {
    const p    = document.createElement('div');
    p.className = 'particle';
    const size  = Math.random() * 4 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const alpha = Math.random() * 0.5 + 0.1;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random() * 100}%;
      background:${color}${alpha});
      box-shadow:0 0 ${size * 3}px ${color}0.3);
      animation-duration:${Math.random() * 14 + 10}s;
      animation-delay:${Math.random() * 12}s;
    `;
    container.appendChild(p);
  }
})();

// ===== SERVICE TABS =====
(function initServiceTabs() {
  const tabs  = document.querySelectorAll('.service-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
})();

// ===== SCROLL REVEAL =====
(function initReveal() {
  const selectors = [
    '.project-card',
    '.about-stat',
    '.skill-circle',
    '.timeline-item',
    '.cert-badge',
    '.contact-link-card',
    '.contact-form',
    '.about-langs .lang-item',
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.classList.add('reveal'));
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 5) * 0.07}s`;
    observer.observe(el);
  });
})();

// ===== CONTACT FORM =====
(function initContactForm() {
  const form      = document.getElementById('contact-form');
  const feedback  = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('contact-submit');
  if (!form || !feedback || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email-input').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name) { 
      showFeedback(dict['form.err_name'] || 'Please enter your name.', 'error'); 
      return; 
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback(dict['form.err_email'] || 'Please enter a valid email address.', 'error'); 
      return; 
    }
    if (!message) { 
      showFeedback(dict['form.err_msg'] || 'Please write a message.', 'error'); 
      return; 
    }

    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = dict['form.sending'] || 'Sending…';

    await new Promise(r => setTimeout(r, 500));

    const subject = document.getElementById('contact-subject').value.trim() || 'Portfolio Contact';
    const body    = `Hi Marcos,\n\nMy name is ${name}.\n\n${message}\n\nBest,\n${name}\n${email}`;
    window.location.href = `mailto:rodriguezmarcos.fi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    showFeedback(dict['form.success'] || '✅ Email client opened. Thank you for reaching out!', 'success');
    form.reset();
    submitBtn.disabled = false;
    if (btnText) btnText.textContent = dict['form.btn_send'] || 'Send Message';
  });

  function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className   = 'form-feedback ' + type;
  }
})();

// ===== FOOTER YEAR =====
(function setYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
})();

// ===== SMOOTH SCROLL =====
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = 76;
      window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
    });
  });
})();

// ===== SKILL CIRCLES — stagger rotate offset =====
(function initSkillCircles() {
  const circles = document.querySelectorAll('.skill-circle-ring');
  circles.forEach((ring, i) => {
    const offset = (i * 60) % 360;
    ring.style.background = `conic-gradient(
      var(--orange) ${offset}deg ${offset + 220}deg,
      rgba(255,98,0,.08) ${offset + 220}deg ${offset + 360}deg
    )`;
  });
})();
