/* ============================================================
   menu.js — Sticky tab active state + smooth scroll to section
   ============================================================ */
(function () {
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.menu-section');

  // Click tab → scroll to section (offset for sticky navbar + tab bar)
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const tabsWrap = document.getElementById('menuTabsWrap');
      const offset = (tabsWrap ? tabsWrap.offsetHeight : 0) + 68 + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Scroll → highlight active tab
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tabs.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.target === id);
        });
        // Scroll active tab into view in the tab strip
        const activeTab = document.querySelector(`.tab-btn[data-target="${id}"]`);
        if (activeTab) {
          activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
})();
