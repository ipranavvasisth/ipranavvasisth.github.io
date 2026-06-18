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
