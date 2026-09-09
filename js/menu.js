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

  // On page load handle hash — scroll to top first, then after full render go to section
  if (window.location.hash) {
    const id = window.location.hash.slice(1);
    // Immediately jump to top to prevent native browser hash scroll
    window.scrollTo(0, 0);
    history.scrollRestoration = 'manual';
    // Wait for full page render then scroll properly
    window.addEventListener('load', () => {
      setTimeout(() => scrollToSection(id), 300);
    });
  }

  // Scroll → highlight active tab
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tabs.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.target === id);
        });
        const activeTab = document.querySelector(`.tab-btn[data-target="${id}"]`);
        if (activeTab) {
          activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
})();
