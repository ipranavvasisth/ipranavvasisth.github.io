/* ═══════════════════════════════════════════════════════
   Pranav Vasisth — Portfolio Scripts
   Theme toggling, scroll animations, navigation
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initScrollReveal();
  initNavigation();
  initSkillBars();
  initMobileMenu();
  initProjectSlider();
  initCertSlider();
});

/* ── Theme Toggle ─────────────────────────────────────── */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Load saved theme or detect system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

/* ── Scroll Reveal Animations ─────────────────────────── */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ── Navigation ───────────────────────────────────────── */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  // Add scrolled class for shadow
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 20);
    lastScroll = scrollY;
  }, { passive: true });

  // Active section highlighting
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '-80px 0px -60% 0px'
  });

  sections.forEach(section => sectionObserver.observe(section));

  // Smooth scroll & close mobile menu on click
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const mobileNav = document.querySelector('.nav-links');
      const menuToggle = document.querySelector('.nav-menu-toggle');
      if (mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        menuToggle.classList.remove('active');
      }
    });
  });
}

/* ── Skill Bar Animations ─────────────────────────────── */
function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const width = fill.getAttribute('data-width');
        fill.style.width = width;
        observer.unobserve(fill);
      }
    });
  }, {
    threshold: 0.5
  });

  skillBars.forEach(bar => observer.observe(bar));
}

/* ── Mobile Menu ──────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-inner') && navLinks.classList.contains('open')) {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });
}

/* ── Projects Horizontal Slider ───────────────────────── */
function initProjectSlider() {
  const track = document.getElementById('projects-track');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const dotsContainer = document.getElementById('slider-dots');

  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const cards = track.querySelectorAll('.project-card');
  if (cards.length === 0) return;

  let currentIndex = 0;

  // Build dot indicators
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to project ${i + 1}`);
    dot.addEventListener('click', () => scrollToCard(i));
    dotsContainer.appendChild(dot);
  });

  function scrollToCard(index) {
    if (index < 0 || index >= cards.length) return;
    currentIndex = index;
    cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    updateControls();
  }

  function updateControls() {
    // Update arrow disabled state
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= cards.length - 1;

    // Update dots
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // Arrow click handlers
  prevBtn.addEventListener('click', () => scrollToCard(currentIndex - 1));
  nextBtn.addEventListener('click', () => scrollToCard(currentIndex + 1));

  // Sync dots & arrows when user scrolls manually (touch swipe, trackpad)
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Find which card is most visible
      const trackRect = track.getBoundingClientRect();
      let closestIndex = 0;
      let closestDist = Infinity;

      cards.forEach((card, i) => {
        const cardRect = card.getBoundingClientRect();
        const dist = Math.abs(cardRect.left - trackRect.left);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });

      currentIndex = closestIndex;
      updateControls();
    }, 100);
  }, { passive: true });

  // Keyboard support when slider is focused/hovered
  track.setAttribute('tabindex', '0');
  track.setAttribute('role', 'region');
  track.setAttribute('aria-label', 'Project carousel');
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToCard(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToCard(currentIndex + 1);
    }
  });

  // Initial state
  updateControls();
}

/* ── Certifications Horizontal Slider ────────────────────── */
function initCertSlider() {
  const track = document.getElementById('certs-track');
  const prevBtn = document.getElementById('cert-slider-prev');
  const nextBtn = document.getElementById('cert-slider-next');
  const dotsContainer = document.getElementById('cert-slider-dots');

  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const cards = track.querySelectorAll('.cert-card');
  if (cards.length === 0) return;

  let currentIndex = 0;

  // Build dot indicators
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to certification ${i + 1}`);
    dot.addEventListener('click', () => scrollToCard(i));
    dotsContainer.appendChild(dot);
  });

  function scrollToCard(index) {
    if (index < 0 || index >= cards.length) return;
    currentIndex = index;
    cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    updateControls();
  }

  function updateControls() {
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= cards.length - 1;

    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // Arrow click handlers
  prevBtn.addEventListener('click', () => scrollToCard(currentIndex - 1));
  nextBtn.addEventListener('click', () => scrollToCard(currentIndex + 1));

  // Sync dots & arrows when user scrolls manually
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const trackRect = track.getBoundingClientRect();
      let closestIndex = 0;
      let closestDist = Infinity;

      cards.forEach((card, i) => {
        const cardRect = card.getBoundingClientRect();
        const dist = Math.abs(cardRect.left - trackRect.left);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });

      currentIndex = closestIndex;
      updateControls();
    }, 100);
  }, { passive: true });

  // Keyboard support
  track.setAttribute('tabindex', '0');
  track.setAttribute('role', 'region');
  track.setAttribute('aria-label', 'Certification carousel');
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToCard(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToCard(currentIndex + 1);
    }
  });

  // Initial state
  updateControls();
}
