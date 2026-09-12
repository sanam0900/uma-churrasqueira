/* ============================================================
   menu.js — Fetch menu-data.json and render all sections
   ============================================================ */
(function () {

  const AVAILABLE_TAGS = ['Nepali Classic', 'Best Seller', 'Popular', 'Best Value', 'Signature Dish', "Chef's Pick", 'Portuguese Classic', 'Nepali'];

  function formatPrice(price) {
    if (typeof price === 'string') return price;
    return '€' + price.toFixed(2).replace('.00', '').replace(/\.(\d)$/, '.$10');
  }

  function buildTag(label) {
    return `<span class="dish-tag">${label}</span>`;
  }

  function buildPhotoCard(card) {
    const variantClass = card.variant === 'landscape' ? ' dish-card--landscape'
                       : card.variant === 'tall'      ? ' dish-card--tall'
                       : '';
    const featuredClass = card.featured ? ' featured' : '';
    const priceDisplay = formatPrice(card.price);
    const tagBadge = card.tags && card.tags.length
      ? `<span class="dish-tag-photo">${buildTag(card.tags[0])}</span>` : '';
    const qty = card.qty ? ` <span class="dish-qty">(${card.qty})</span>` : '';

    return `
      <div class="dish-card${variantClass}${featuredClass}">
        <div class="dish-photo">
          <img src="${card.image}" alt="${card.name}" loading="lazy" />
          <span class="dish-price-badge">${priceDisplay}</span>
          ${tagBadge}
        </div>
        <div class="dish-body">
          <h3>${card.name}${qty}</h3>
          ${card.description ? `<p>${card.description}</p>` : ''}
        </div>
      </div>`;
  }

  function buildCompactCard(card) {
    const priceDisplay = formatPrice(card.price);
    const tagBadge = card.tags && card.tags.length
      ? buildTag(card.tags[0]) : '';
    return `
      <div class="dish-card compact">
        <div class="dish-body">
          <div><h3>${card.name}${tagBadge ? ` <span class="dish-tag inline">${card.tags[0]}</span>` : ''}</h3></div>
          <span class="dish-price">${priceDisplay}</span>
        </div>
      </div>`;
  }

  function buildSection(section) {
    const noteLine = section.note
      ? `<p class="menu-section-sub">${section.note}</p>` : '';
    const titleSuffix = section.titleSuffix
      ? ` <span class="menu-section-note">${section.titleSuffix}</span>` : '';
    const gridClass = section.gridSize === 'small' ? 'menu-grid menu-grid-sm' : 'menu-grid';

    let cardsHTML = '';

    if (section.subgroups) {
      // Drinks section with subgroups
      section.subgroups.forEach(sg => {
        if (sg.heading) {
          cardsHTML += `<h3 class="drinks-subheading">${sg.heading}</h3>`;
        }
        if (sg.note) {
          cardsHTML += `<p class="drinks-subheading-note">${sg.note}</p>`;
        }
        cardsHTML += `<div class="menu-grid menu-grid-sm">`;
        sg.cards.forEach(card => {
          cardsHTML += buildCompactCard(card);
        });
        cardsHTML += `</div>`;
      });
    } else {
      cardsHTML += `<div class="${gridClass}">`;
      section.cards.forEach(card => {
        cardsHTML += card.variant === 'compact'
          ? buildCompactCard(card)
          : buildPhotoCard(card);
      });
      cardsHTML += `</div>`;
    }

    return `
      <section class="menu-section" id="${section.id}">
        <div class="menu-section-header">
          <span class="menu-category-icon">${section.icon}</span>
          <h2>${section.title}${titleSuffix}</h2>
          ${noteLine}
        </div>
        ${cardsHTML}
      </section>`;
  }

  function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabsWrap = document.getElementById('menuTabsWrap');

    function getOffset() {
      return (tabsWrap ? tabsWrap.offsetHeight : 0) + 68 + 8;
    }

    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (!target) return;
        window.scrollTo({ top: target.offsetTop - getOffset(), behavior: 'smooth' });
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Highlight tab on scroll
    const sections = Array.from(document.querySelectorAll('.menu-section'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tabs.forEach(b => b.classList.remove('active'));
          const active = document.querySelector(`.tab-btn[data-target="${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));

    // Jump from home page cards
    const menuTarget = sessionStorage.getItem('menuTarget');
    if (menuTarget) {
      sessionStorage.removeItem('menuTarget');
      requestAnimationFrame(() => {
        const target = document.getElementById(menuTarget);
        if (target) {
          window.scrollTo({ top: target.offsetTop - getOffset(), behavior: 'instant' });
          tabs.forEach(b => b.classList.remove('active'));
          const activeBtn = document.querySelector(`.tab-btn[data-target="${menuTarget}"]`);
          if (activeBtn) activeBtn.classList.add('active');
        }
      });
    }
  }

  async function renderMenu() {
    const container = document.getElementById('menu-content');
    if (!container) return;

    try {
      const res = await fetch('menu-data.json');
      if (!res.ok) throw new Error('Failed to load menu data');
      const data = await res.json();

      container.innerHTML = data.sections.map(buildSection).join('');
    } catch (err) {
      container.innerHTML = '<p style="color:rgba(255,255,255,0.4);padding:40px 0;">Menu unavailable. Please try again.</p>';
      console.error(err);
    }

    initTabs();
  }

  renderMenu();

})();
