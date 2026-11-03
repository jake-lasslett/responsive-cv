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
  window.addEventListener('scroll', debounce(scrollUp), { passive: true });

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
  // The initial theme is applied by the inline script in <head> to avoid a flash.
  // Only an explicit click saves a choice; otherwise the system setting is followed.
  const themeButton = document.getElementById('theme-button');
  const root = document.documentElement;
  const darkTheme = 'dark-theme';

  const syncThemeButton = () => {
    if (themeButton) {
      themeButton.setAttribute('aria-pressed', String(root.classList.contains(darkTheme)));
    }
  };
  syncThemeButton();

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const isDark = root.classList.toggle(darkTheme);
      syncThemeButton();
      try {
        localStorage.setItem('selected-theme', isDark ? 'dark' : 'light');
      } catch (e) {
        // Storage can be blocked (private mode); the toggle still works for this visit
      }
    });
  }

  /*=============== SKILL HIGHLIGHTING ===============*/
  // Picking a skill highlights every role or project tagged with it (data-skills)
  // and fades the rest. Picking it again, or pressing Escape, clears it.
  const skillButtons = document.querySelectorAll('.skill');
  const taggedItems = document.querySelectorAll('[data-skills]');
  const skillsHint = document.getElementById('skills-hint');
  const defaultHint = skillsHint ? skillsHint.textContent : '';
  let activeSkill = null;

  const selectSkill = (skill, button) => {
    activeSkill = skill === activeSkill ? null : skill;
    document.body.classList.toggle('is-filtering', activeSkill !== null);

    const matches = [];
    taggedItems.forEach(item => {
      const isMatch = activeSkill !== null && item.dataset.skills.split(' ').includes(activeSkill);
      item.classList.toggle('is-match', isMatch);
      if (isMatch) matches.push(item);
    });
    skillButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.skill === activeSkill)));

    if (skillsHint) {
      if (activeSkill === null) {
        skillsHint.textContent = defaultHint;
      } else {
        const label = button.textContent.trim();
        const places = matches.length === 1 ? 'place' : 'places';
        skillsHint.textContent = `${label}: ${matches.length} ${places} highlighted. Pick it again to clear.`;
      }
    }

    // Bring the first match into view if it is off screen (e.g. skills sit below content on mobile)
    const first = matches[0];
    if (first) {
      const rect = first.getBoundingClientRect();
      if (rect.top < 0 || rect.top > window.innerHeight * 0.8) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
    }
  };

  skillButtons.forEach(button => {
    button.addEventListener('click', () => selectSkill(button.dataset.skill, button));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeSkill !== null) {
      selectSkill(activeSkill);
    }
  });

});
  }

});
