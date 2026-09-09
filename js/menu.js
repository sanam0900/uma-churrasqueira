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

  // Handle incoming hash from home page cards
  // Store target, strip hash, then scroll after all images load
  if (window.location.hash) {
    const id = window.location.hash.slice(1);
    sessionStorage.setItem('menuScrollTarget', id);
    // Remove hash without triggering scroll
    history.replaceState(null, '', window.location.pathname);
  }

  const scrollTarget = sessionStorage.getItem('menuScrollTarget');
  if (scrollTarget) {
    sessionStorage.removeItem('menuScrollTarget');
    // Wait for all images to finish loading before scrolling
    window.addEventListener('load', () => {
      // Extra delay to let layout fully settle
      setTimeout(() => scrollToSection(scrollTarget), 200);
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
