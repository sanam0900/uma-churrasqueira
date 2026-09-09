/* ============================================================
   menu.js — Sticky tab active state + smooth scroll to section
   ============================================================ */
(function () {
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.menu-section');

  function getOffset() {
    const navbar = document.getElementById('navbar');
    const tabsWrap = document.getElementById('menuTabsWrap');
    return (navbar ? navbar.offsetHeight : 68) + (tabsWrap ? tabsWrap.offsetHeight : 52) + 12;
  }

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - getOffset();
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // Click tab → scroll to section
  tabs.forEach(btn => {
    btn.addEventListener('click', () => scrollToSection(btn.dataset.target));
  });

  // Handle hash from home page cards via sessionStorage
  if (window.location.hash) {
    const id = window.location.hash.slice(1);
    sessionStorage.setItem('menuScrollTarget', id);
    history.replaceState(null, '', window.location.pathname);
  }

  const scrollTarget = sessionStorage.getItem('menuScrollTarget');
  if (scrollTarget) {
    sessionStorage.removeItem('menuScrollTarget');
    window.addEventListener('load', () => {
      setTimeout(() => scrollToSection(scrollTarget), 200);
    });
  }

  // Scroll → highlight active tab (with debounce to avoid fighting smooth scroll)
  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      let current = sections[0].id;
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= getOffset() + 20) {
          current = section.id;
        }
      });
      tabs.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === current);
      });
      const activeTab = document.querySelector(`.tab-btn[data-target="${current}"]`);
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 50);
  }, { passive: true });

})();
