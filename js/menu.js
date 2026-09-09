/* ============================================================
   menu.js — Sticky tab active state + smooth scroll to section
   ============================================================ */
(function () {
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.menu-section');

  function getOffset() {
    const tabsWrap = document.getElementById('menuTabsWrap');
    return (tabsWrap ? tabsWrap.offsetHeight : 0) + 68 + 8;
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

  // On page load, if URL has a hash scroll to it correctly (offset for sticky bars)
  window.addEventListener('load', () => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => scrollToSection(id), 100);
    }
  });

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
