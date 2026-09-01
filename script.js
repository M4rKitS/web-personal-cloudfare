/* =============================================
   MARCOS RODRÍGUEZ — Personal Tech Portfolio
   script.js — Interactive Engine & 3D Particle Mesh
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- 1. LANGUAGE / I18N ENGINE ---
  let currentLang = localStorage.getItem('site_lang') || 'en';

  function applyLanguage(lang) {
    if (!TRANSLATIONS[lang]) lang = 'en';
    currentLang = lang;
    localStorage.setItem('site_lang', lang);
    document.documentElement.lang = lang;

    // Update Text Elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (TRANSLATIONS[lang][key]) {
        el.textContent = TRANSLATIONS[lang][key];
      }
    });

    // Update Placeholder Elements
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (TRANSLATIONS[lang][key]) {
        el.setAttribute('placeholder', TRANSLATIONS[lang][key]);
      }
    });

    // Update HTML-enabled Elements
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (TRANSLATIONS[lang][key]) {
        el.innerHTML = TRANSLATIONS[lang][key];
      }
    });

    // Update Page Title and Meta Description
    if (TRANSLATIONS[lang]['meta.title']) {
      document.title = TRANSLATIONS[lang]['meta.title'];
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && TRANSLATIONS[lang]['meta.description']) {
      metaDesc.setAttribute('content', TRANSLATIONS[lang]['meta.description']);
    }

    // Update Active Language Switcher Buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Clear form feedback on language change
    const formFeedback = document.getElementById('form-feedback');
    if (formFeedback) {
      formFeedback.removeAttribute('data-i18n');
      formFeedback.textContent = '';
      formFeedback.className = 'form-feedback ';
    }
  }

  // Language switcher event listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang && targetLang !== currentLang) {
        applyLanguage(targetLang);
      }
    });
  });

  // Apply initial language
  applyLanguage(currentLang);

  // --- 1.5 ACCORDION ENGINE ---
  document.querySelectorAll('.certs-accordion').forEach(accordion => {
    const btn = accordion.querySelector('.certs-accordion-btn');
    const countSpan = accordion.querySelector('.accordion-count');
    const cards = accordion.querySelectorAll('.cert-card');
    
    // Dynamic Count
    if (countSpan && cards) {
      countSpan.textContent = `(${cards.length})`;
    }

    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = accordion.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen);
      });
    }
  });


  // --- 2. 3D TOPOGRAPHIC PARTICLE WAVE CANVAS ENGINE ---
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = 0;
    let height = 0;

    // Mouse Tracking with momentum
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    let isHovering = false;
    let currentScroll = window.pageYOffset || 0;
    let targetScroll = currentScroll;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    window.addEventListener('scroll', () => {
      targetScroll = window.pageYOffset || document.documentElement.scrollTop;
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      isHovering = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      isHovering = false;
    });

    // Topographic Grid Parameters
    const rows = 50;
    const cols = 75;
    let time = 0;

    function renderParticleWave() {
      time += 0.011;

      // Smooth scroll interpolation
      currentScroll += (targetScroll - currentScroll) * 0.08;
      const scrollFactor = currentScroll * 0.0018;

      // Smooth mouse interpolation
      if (isHovering) {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      } else {
        mouse.x += (-1000 - mouse.x) * 0.05;
        mouse.y += (-1000 - mouse.y) * 0.05;
      }

      ctx.clearRect(0, 0, width, height);

      // Centered 3D Topographic Mesh spanning across the screen & text
      const originX = width * 0.5;
      const originY = height * 0.48;
      const spacingX = (width * 1.1) / cols;
      const spacingY = (height * 0.85) / rows;

      for (let r = 0; r < rows; r++) {
        const v = (r - rows * 0.5) / rows; // -0.5 to 0.5 normalized
        const rowDepth = r / rows;

        for (let c = 0; c < cols; c++) {
          const u = (c - cols * 0.5) / cols; // -0.5 to 0.5 normalized

          // Perspective and base coordinates
          const perspective = 1 + rowDepth * 0.4;
          const baseX = originX + (u * width * 1.15) * perspective;
          const baseY = originY + (v * height * 0.85) * perspective;

          // Harmonic Wave elevation calculation with scroll factoring
          const wave1 = Math.sin(u * 6 + time * 1.4 + v * 4 + scrollFactor * 2) * 32;
          const wave2 = Math.cos(v * 7 - time * 1.1 + u * 3 - scrollFactor * 1.5) * 24;
          const wave3 = Math.sin((u * 4 + v * 4) + time * 1.8 + scrollFactor) * 18;
          let elevation = wave1 + wave2 + wave3;

          // Interactive Mouse reaction
          const dx = baseX - mouse.x;
          const dy = baseY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 260) {
            const force = (1 - dist / 260) * 55;
            elevation -= force;
          }

          const posX = baseX;
          const posY = baseY + elevation;

          // Radial falloff from screen edges so particles smoothly fade out
          const distFromCenter = Math.sqrt(u * u + v * v);
          const edgeAlpha = Math.max(0, 1 - distFromCenter * 1.6);

          // Alpha & Size based on wave crests and depth
          const waveAlpha = Math.max(0.1, Math.min(1, (elevation + 45) / 75));
          const finalAlpha = edgeAlpha * waveAlpha * (0.35 + rowDepth * 0.65);

          if (finalAlpha <= 0.02) continue;

          const dotSize = Math.max(0.7, 1.2 + (elevation / 30) + (rowDepth * 0.7));

          // Draw Particle
          ctx.beginPath();
          ctx.arc(posX, posY, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha * 0.82})`;
          ctx.fill();

          // Connect subtle wireframe lines on alternating rows
          if (c > 0 && r % 2 === 0 && finalAlpha > 0.18) {
            ctx.beginPath();
            ctx.moveTo(posX, posY);
            ctx.lineTo(posX - spacingX * perspective, posY);
            ctx.strokeStyle = `rgba(255, 255, 255, ${finalAlpha * 0.07})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderParticleWave);
    }

    renderParticleWave();

    // Pause animation when page is hidden to save CPU/battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        renderParticleWave();
      }
    });
  }


  // --- 3. STACK / PROJECTS FILTERING ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const stackCards = document.querySelectorAll('.stack-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      stackCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(8px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });


  // --- 3.5 PROJECT PHONE COLLAGE WITH LIGHTBOX ---
  const m4rkcalCollage = document.getElementById('m4rkcalCollage');
  const m4rkcalLightbox = document.getElementById('m4rkcalLightbox');
  const m4rkcalLightboxImg = document.getElementById('m4rkcalLightboxImg');

  if (m4rkcalCollage && m4rkcalLightbox && m4rkcalLightboxImg) {
    m4rkcalCollage.querySelectorAll('.phone').forEach(phone => {
      phone.addEventListener('click', () => {
        const img = phone.querySelector('img');
        m4rkcalLightboxImg.src = img.src;
        m4rkcalLightboxImg.alt = img.alt;
        m4rkcalLightbox.classList.add('active');
      });
    });
    m4rkcalLightbox.addEventListener('click', () => {
      m4rkcalLightbox.classList.remove('active');
    });
  }


  // --- 4. TERMINAL CONTACT FORM ---
  if (typeof emailjs !== 'undefined') {
    emailjs.init("d4w05JCeQd75BiH0Q");
  }

  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('contact-submit');

  if (contactForm) {
    // Clear feedback when user starts typing again
    contactForm.addEventListener('input', () => {
      showFeedback('', '');
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const subjectInput = document.getElementById('contact-subject');
      const messageInput = document.getElementById('contact-message');

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim() || 'Portfolio Contact from ' + name;
      const message = messageInput.value.trim();

      const langData = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];

      // Validation
      if (!name) {
        showFeedback('form.err_name', 'error');
        nameInput.focus();
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFeedback('form.err_email', 'error');
        emailInput.focus();
        return;
      }
      if (!message) {
        showFeedback('form.err_msg', 'error');
        messageInput.focus();
        return;
      }

      // UI Loading State
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        const btnText = submitBtn.querySelector('.btn-text');
        if (btnText) {
          btnText.setAttribute('data-i18n', 'form.status_sending');
          btnText.textContent = langData['form.status_sending'] || 'SENDING...';
        }
      }
      showFeedback('', '');

      // Parse Multi-Language Auto-Reply
      const replySubject = langData['email.reply_subject'] || 'Message Received - M4rKitS.dev';
      let replyMessage = langData['email.reply_message'] || '';
      replyMessage = replyMessage.replace(/{{from_name}}/g, name).replace(/{{subject}}/g, subject);

      // Email 1: Notification to Owner
      const templateParamsOwner = {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message
      };

      // Email 2: Auto-reply to Sender
      const templateParamsSender = {
        from_name: name,
        from_email: email,
        subject: subject,
        reply_subject: replySubject,
        reply_message: replyMessage
      };

      Promise.all([
        emailjs.send("service_utwds39", "template_9bv8r1n", templateParamsOwner),
        emailjs.send("service_utwds39", "template_dnumxnq", templateParamsSender)
      ])
      .then(() => {
        showFeedback('form.status_success', 'success');
        contactForm.reset();
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);
        showFeedback('form.status_error', 'error');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          const btnText = submitBtn.querySelector('.btn-text');
          if (btnText) {
            btnText.setAttribute('data-i18n', 'form.btn_send');
            btnText.textContent = langData['form.btn_send'] || 'SEND MESSAGE';
          }
        }
      });
    });
  }

  function showFeedback(i18nKey, type) {
    if (!formFeedback) return;
    if (i18nKey) {
      formFeedback.setAttribute('data-i18n', i18nKey);
      const langData = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
      formFeedback.textContent = langData[i18nKey] || '';
    } else {
      formFeedback.removeAttribute('data-i18n');
      formFeedback.textContent = '';
    }
    formFeedback.className = 'form-feedback ' + type;
  }



  // --- 6. NAVBAR SCROLL & ACTIVE SECTION HIGHLIGHT ---
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Header background blur intensification on scroll
    if (header) {
      header.classList.toggle('scrolled', scrollY > 40);
    }

    // Highlight active menu item based on viewport position
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + sectionId);
        });
      }
    });
  }, { passive: true });


  // --- 7. MOBILE MENU TOGGLE ---
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a navigation link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      });
    });
  }


  // --- 8. DRAGGABLE WHATSAPP FLOATING BUTTON ---
  const waContainer = document.getElementById('whatsapp-draggable');
  const waBtn = document.getElementById('whatsapp-btn');

  if (waContainer) {
    let isDragging = false;
    let startX, startY;
    let initialLeft, initialTop;
    let hasMoved = false;

    waContainer.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      isDragging = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;

      const rect = waContainer.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      waContainer.style.bottom = 'auto';
      waContainer.style.right = 'auto';
      waContainer.style.left = initialLeft + 'px';
      waContainer.style.top = initialTop + 'px';
      waContainer.classList.add('is-dragging');

      try {
        waContainer.setPointerCapture(e.pointerId);
      } catch (err) {}
    });

    waContainer.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMoved = true;
      }

      let newLeft = initialLeft + deltaX;
      let newTop = initialTop + deltaY;

      const maxLeft = window.innerWidth - waContainer.offsetWidth - 12;
      const maxTop = window.innerHeight - waContainer.offsetHeight - 12;

      newLeft = Math.max(12, Math.min(newLeft, maxLeft));
      newTop = Math.max(12, Math.min(newTop, maxTop));

      waContainer.style.left = newLeft + 'px';
      waContainer.style.top = newTop + 'px';
    });

    function endDrag(e) {
      if (isDragging) {
        isDragging = false;
        waContainer.classList.remove('is-dragging');
        try {
          waContainer.releasePointerCapture(e.pointerId);
        } catch (err) {}

        // If user just clicked without dragging, manually open the link 
        // since pointerCapture swallows the native child click event.
        if (!hasMoved && waBtn) {
          window.open(waBtn.href, '_blank', 'noopener,noreferrer');
        }
      }
    }

    waContainer.addEventListener('pointerup', endDrag);
    waContainer.addEventListener('pointercancel', endDrag);

    // Prevent default click completely to avoid double-firing or conflicts
    if (waBtn) {
      waBtn.addEventListener('click', (e) => {
        e.preventDefault();
      });
    }
  }


  // --- 9. FOOTER DYNAMIC CURRENT YEAR ---
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

