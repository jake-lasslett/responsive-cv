// Wait for the entire HTML document to be loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

  // UTILITY FUNCTION: Debounce (limits how often a function can run)
  function debounce(func, delay = 20) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /*=============== SHOW SCROLL UP ===============*/
  const scrollUp = () => {
    const scrollUpButton = document.getElementById('scroll-up');
    if (scrollUpButton) {
      window.scrollY >= 350 ? scrollUpButton.classList.add('show-scroll')
                            : scrollUpButton.classList.remove('show-scroll');
    }
  };
  window.addEventListener('scroll', debounce(scrollUp));

  /*=============== AUTO-HIDE NAV WHILE SCROLLING DOWN ===============*/
  // Frees up reading space: the floating nav slides away as you scroll down
  // through the content and reappears the moment you scroll back up.
  const header = document.getElementById('header');
  if (header) {
    let lastScrollY = window.scrollY;
    const updateNavVisibility = () => {
      const current = window.scrollY;
      // Ignore tiny jitters; only react to deliberate scrolling
      if (Math.abs(current - lastScrollY) > 6) {
        const scrollingDown = current > lastScrollY;
        // Never hide near the very top so the nav is always there to start with
        header.classList.toggle('header--hidden', scrollingDown && current > 250);
        lastScrollY = current;
      }
    };
    window.addEventListener('scroll', updateNavVisibility, { passive: true });
  }

  /*=============== SCROLL SECTIONS ACTIVE LINK (OPTIMIZED) ===============*/
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const navLink = document.querySelector(`.nav__menu a[href*=${id}]`);
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav__menu a').forEach(link => link.classList.remove('active-link'));
        if (navLink) {
          navLink.classList.add('active-link');
        }
      }
    });
  }, { rootMargin: '-40% 0px -60% 0px' });

  sections.forEach(section => observer.observe(section));

  /*=============== DARK LIGHT THEME ===============*/
  const themeButton = document.getElementById('theme-button');
  const darkTheme = 'dark-theme';
  const sunIcon = 'ri-sun-line';
  const moonIcon = 'ri-moon-line';
  const savedTheme = localStorage.getItem('selected-theme');

  const applyTheme = (theme) => {
    document.body.classList.toggle(darkTheme, theme === 'dark');
    if (themeButton) {
      themeButton.classList.toggle(sunIcon, theme !== 'dark');
      themeButton.classList.toggle(moonIcon, theme === 'dark');
    }
    localStorage.setItem('selected-theme', theme);
  };
  
  applyTheme(savedTheme || 'dark'); // Default to dark mode if no theme is saved

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const newTheme = document.body.classList.contains(darkTheme) ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
  
  /*=============== GENERATE PDF ===============*/
  const pdfButton = document.getElementById('download-pdf-btn');
  if (pdfButton) {
    pdfButton.addEventListener('click', () => {
      window.print();
    });
  }

});