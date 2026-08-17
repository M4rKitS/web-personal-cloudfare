/* =============================================
   MARCOS RODRÍGUEZ — Personal Portfolio
   script.js
   ============================================= */

'use strict';

// ===== NAVBAR SCROLL EFFECT =====
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!navbar || !toggle || !navLinks) return;

  // Scroll handler
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile toggle
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on link click (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ===== TYPEWRITER EFFECT =====
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'Full Stack Web Developer',
    'IT Systems Technician',
    'AI & Automation Enthusiast',
    'Logistics & Operations Pro',
    'Based in Vantaa, Helsinki 🇫🇮',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let isPausing = false;

  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');

  function type() {
    const currentPhrase = phrases[phraseIdx];

    if (isPausing) {
      isPausing = false;
      setTimeout(type, isDeleting ? 50 : 1400);
      return;
    }

    if (isDeleting) {
      charIdx--;
    } else {
      charIdx++;
    }

    el.textContent = currentPhrase.slice(0, charIdx);
    el.appendChild(cursor);

    if (!isDeleting && charIdx === currentPhrase.length) {
      isDeleting = true;
      isPausing = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }

    const speed = isDeleting ? 55 : 90;
    setTimeout(type, speed + (Math.random() * 40 - 20));
  }

  setTimeout(type, 800);
})();

// ===== FLOATING PARTICLES (HERO) =====
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const COUNT = 28;
  const colors = ['rgba(255,98,0,', 'rgba(255,122,32,', 'rgba(255,61,0,'];

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 4 + 2;
    const colorBase = colors[Math.floor(Math.random() * colors.length)];
    const opacity = Math.random() * 0.5 + 0.15;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colorBase}${opacity});
      box-shadow: 0 0 ${size * 3}px ${colorBase}0.3);
      animation-duration: ${Math.random() * 12 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;

    container.appendChild(p);
  }
})();

// ===== SCROLL REVEAL =====
(function initScrollReveal() {
  const targets = [
    '.about-grid',
    '.stat-card',
    '.skill-category',
    '.project-card',
    '.timeline-item',
    '.cert-badge',
    '.contact-card',
    '.contact-form-wrapper',
    '.certs-section',
  ];

  // Add reveal class to all target elements
  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('reveal');
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    // Stagger delay based on position
    el.style.transitionDelay = `${(i % 6) * 0.06}s`;
    observer.observe(el);
  });
})();

// ===== CONTACT FORM HANDLER =====
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('contact-submit');

  if (!form || !feedback || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email-input').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    // Basic validation
    if (!name) {
      showFeedback('Please enter your name.', 'error');
      return;
    }
    if (!email || !isValidEmail(email)) {
      showFeedback('Please enter a valid email address.', 'error');
      return;
    }
    if (!message) {
      showFeedback('Please write a message.', 'error');
      return;
    }

    // Simulate send (in production, replace with real API call)
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Sending…';
    showFeedback('', '');

    await simulateSend();

    // Build mailto fallback
    const subject = document.getElementById('contact-subject').value.trim() || 'Portfolio Contact';
    const body = `Hi Marcos,\n\nMy name is ${name}.\n\n${message}\n\nBest,\n${name}\n${email}`;
    const mailtoUrl = `mailto:rodriguezmarcos.fi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    showFeedback('✅ Your email client has been opened! Thank you for reaching out.', 'success');
    form.reset();

    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Send Message';
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className = 'form-note ' + type;
  }

  function simulateSend() {
    return new Promise(resolve => setTimeout(resolve, 600));
  }
})();

// ===== CURRENT YEAR IN FOOTER =====
(function setYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
})();

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// ===== ACTIVE NAV LINK ON SCROLL =====
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if (!sections.length || !navAnchors.length) return;

  const navH = 80;

  window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
      const top = section.offsetTop - navH - 40;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navAnchors.forEach(a => {
      a.style.color = '';
      if (a.getAttribute('href') === `#${current}`) {
        a.style.color = 'var(--clr-primary)';
      }
    });
  }, { passive: true });
})();

// ===== TILT EFFECT ON PROJECT CARDS =====
(function initTilt() {
  const cards = document.querySelectorAll('.project-card, .skill-category');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();
