/* ============================================================
   menu.js — Sticky tab active state + smooth scroll to section
   ============================================================ */
(function () {
  const tabs = document.querySelectorAll('.tab-btn');

  // Click tab → scroll to section
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const tabsWrap = document.getElementById('menuTabsWrap');
      const offset = (tabsWrap ? tabsWrap.offsetHeight : 0) + 68 + 8;
      const top = target.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Update active tab
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // From home page cards — read sessionStorage and jump to section
  const menuTarget = sessionStorage.getItem('menuTarget');
  if (menuTarget) {
    sessionStorage.removeItem('menuTarget');
    const target = document.getElementById(menuTarget);
    if (target) {
      const tabsWrap = document.getElementById('menuTabsWrap');
      const offset = (tabsWrap ? tabsWrap.offsetHeight : 0) + 68 + 8;
      const top = target.offsetTop - offset;
      window.scrollTo({ top, behavior: 'instant' });
      tabs.forEach(b => b.classList.remove('active'));
      const activeBtn = document.querySelector(`.tab-btn[data-target="${menuTarget}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }
  }

})();
