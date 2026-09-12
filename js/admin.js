/* ============================================================
   admin.js — Uma Churrasqueira Menu Admin Panel
   ============================================================ */

const ADMIN_PASSWORD = 'uma2026';

const AVAILABLE_TAGS = [
  'Nepali Classic', 'Best Seller', 'Popular', 'Best Value',
  "Signature Dish", "Chef's Pick", 'Portuguese Classic', 'Nepali'
];

const VARIANTS = ['standard', 'landscape', 'tall', 'compact'];

let menuData = null;
let hasChanges = false;
let currentSectionId = null;

// ---- Utils ----

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toast(msg, duration = 3000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('visible'), duration);
}

function markChanged() {
  hasChanges = true;
  document.getElementById('unsavedDot').style.opacity = '1';
}

function formatPrice(price) {
  if (typeof price === 'string') return price;
  return '€' + parseFloat(price).toFixed(2).replace('.00', '');
}

// ---- Login ----

function checkLogin() {
  return sessionStorage.getItem('uma_admin') === 'true';
}

function login() {
  const pw = document.getElementById('loginPw').value;
  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem('uma_admin', 'true');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminShell').classList.add('visible');
    initAdmin();
  } else {
    document.getElementById('loginError').classList.add('visible');
    document.getElementById('loginPw').value = '';
    document.getElementById('loginPw').focus();
  }
}

document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('loginPw').addEventListener('keydown', e => {
  if (e.key === 'Enter') login();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('uma_admin');
  location.reload();
});

// ---- Export JSON ----

document.getElementById('exportBtn').addEventListener('click', () => {
  if (!menuData) return;
  const blob = new Blob([JSON.stringify(menuData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'menu-data.json';
  a.click();
  URL.revokeObjectURL(url);
  hasChanges = false;
  document.getElementById('unsavedDot').style.opacity = '0';
  toast('✅ menu-data.json downloaded! Commit it to GitHub to go live.');
});

// ---- Init ----

async function initAdmin() {
  try {
    const res = await fetch('menu-data.json');
    if (!res.ok) throw new Error('Failed to load menu-data.json');
    menuData = await res.json();
    buildSidebar();
    // Open first section by default
    if (menuData.sections.length > 0) {
      openSection(menuData.sections[0].id);
    }
  } catch (err) {
    document.getElementById('adminMain').innerHTML =
      `<p style="color:#e74c3c;margin-top:40px;">Error loading menu data: ${esc(err.message)}</p>`;
  }
}

// ---- Sidebar ----

function buildSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  sidebar.innerHTML = '<p class="sidebar-label">Sections</p>';
  menuData.sections.forEach(section => {
    const count = section.cards
      ? section.cards.length
      : section.subgroups
        ? section.subgroups.reduce((n, sg) => n + sg.cards.length, 0)
        : 0;
    const item = document.createElement('div');
    item.className = 'sidebar-item';
    item.dataset.id = section.id;
    item.innerHTML = `
      <span class="sidebar-icon">${section.icon}</span>
      <span>${section.title}</span>
      <span class="sidebar-count">${count}</span>`;
    item.addEventListener('click', () => openSection(section.id));
    sidebar.appendChild(item);
  });
}

function updateSidebarCount(sectionId) {
  const section = menuData.sections.find(s => s.id === sectionId);
  if (!section) return;
  const count = section.cards
    ? section.cards.length
    : section.subgroups
      ? section.subgroups.reduce((n, sg) => n + sg.cards.length, 0)
      : 0;
  const item = document.querySelector(`.sidebar-item[data-id="${sectionId}"] .sidebar-count`);
  if (item) item.textContent = count;
}

// ---- Open section ----

function openSection(sectionId) {
  currentSectionId = sectionId;
  document.querySelectorAll('.sidebar-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === sectionId);
  });
  const section = menuData.sections.find(s => s.id === sectionId);
  if (!section) return;

  if (section.subgroups) {
    renderDrinksSection(section);
  } else {
    renderFoodSection(section);
  }
}

// ---- Food section ----

function renderFoodSection(section) {
  const main = document.getElementById('adminMain');
  main.innerHTML = `
    <h2 class="admin-section-title">${esc(section.icon)} ${esc(section.title)}</h2>
    <p class="admin-section-note">${section.note ? esc(section.note) : 'No section note'}</p>
    <div class="admin-actions-row">
      <button class="btn-admin btn-teal btn-sm" id="addItemBtn">+ Add Item</button>
    </div>
    <div class="admin-cards-grid" id="cardsGrid"></div>`;

  const grid = document.getElementById('cardsGrid');
  section.cards.forEach((card, idx) => {
    grid.appendChild(buildFoodEditorCard(card, idx, section));
  });

  document.getElementById('addItemBtn').addEventListener('click', () => {
    const newCard = {
      id: 'item-' + Date.now(),
      name: 'New Item',
      qty: '',
      description: '',
      price: 0,
      image: '',
      featured: false,
      variant: 'standard',
      tags: []
    };
    section.cards.push(newCard);
    const newIdx = section.cards.length - 1;
    const cardEl = buildFoodEditorCard(newCard, newIdx, section);
    cardEl.classList.add('is-new');
    grid.appendChild(cardEl);
    cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    markChanged();
    updateSidebarCount(section.id);
  });
}

function buildFoodEditorCard(card, idx, section) {
  const el = document.createElement('div');
  el.className = 'editor-card';
  el.dataset.cardId = card.id;

  const imgSrc = card.image || '';
  const tagChips = AVAILABLE_TAGS.map(tag => `
    <span class="tag-chip ${card.tags && card.tags.includes(tag) ? 'active' : ''}" data-tag="${esc(tag)}">${esc(tag)}</span>
  `).join('');

  const variantOpts = VARIANTS.map(v =>
    `<option value="${v}" ${card.variant === v ? 'selected' : ''}>${v}</option>`
  ).join('');

  el.innerHTML = `
    <div class="editor-card-header">
      ${imgSrc ? `<img class="editor-card-img" src="${esc(imgSrc)}" alt="${esc(card.name)}" onerror="this.style.display='none'" />` : `<div class="editor-card-img"></div>`}
      <div class="editor-card-title" style="padding-left:12px;">${esc(card.name)}</div>
    </div>
    <div class="field-row">
      <div class="field">
        <label>Name</label>
        <input type="text" class="f-name" value="${esc(card.name)}" />
      </div>
      <div class="field">
        <label>Qty (e.g. "10 uni.")</label>
        <input type="text" class="f-qty" value="${esc(card.qty || '')}" />
      </div>
    </div>
    <div class="field field-row single">
      <label>Description</label>
      <textarea class="f-desc">${esc(card.description || '')}</textarea>
    </div>
    <div class="field-row">
      <div class="field">
        <label>Price (€)</label>
        <input type="text" class="f-price price-input" value="${esc(String(card.price))}" />
      </div>
      <div class="field">
        <label>Variant</label>
        <select class="f-variant">${variantOpts}</select>
      </div>
    </div>
    <div class="field field-row single">
      <label>Image path (e.g. Pics/chicken.png)</label>
      <input type="text" class="f-image" value="${esc(card.image || '')}" />
    </div>
    <div class="toggle-row">
      <span class="toggle-label">Featured (gold border)</span>
      <label class="toggle">
        <input type="checkbox" class="f-featured" ${card.featured ? 'checked' : ''} />
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div class="field">
      <label>Tags</label>
      <div class="tags-row">${tagChips}</div>
    </div>
    <div class="editor-card-footer">
      <button class="btn-admin btn-danger btn-sm del-btn">🗑 Delete</button>
    </div>`;

  // Wire up live edits
  function sync() {
    card.name        = el.querySelector('.f-name').value;
    card.qty         = el.querySelector('.f-qty').value;
    card.description = el.querySelector('.f-desc').value;
    const rawPrice   = el.querySelector('.f-price').value.replace('€', '').trim();
    card.price       = isNaN(parseFloat(rawPrice)) ? rawPrice : parseFloat(rawPrice);
    card.variant     = el.querySelector('.f-variant').value;
    card.image       = el.querySelector('.f-image').value;
    card.featured    = el.querySelector('.f-featured').checked;
    el.querySelector('.editor-card-title').textContent = card.name;
    // Update image preview
    const imgEl = el.querySelector('.editor-card-img');
    if (imgEl && card.image) {
      imgEl.src = card.image;
      imgEl.style.display = '';
    }
    markChanged();
  }

  el.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
  });

  // Tags
  el.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.tag;
      if (!card.tags) card.tags = [];
      const i = card.tags.indexOf(tag);
      if (i >= 0) {
        card.tags.splice(i, 1);
        chip.classList.remove('active');
      } else {
        card.tags.push(tag);
        chip.classList.add('active');
      }
      markChanged();
    });
  });

  // Delete
  el.querySelector('.del-btn').addEventListener('click', () => {
    if (!confirm(`Delete "${card.name}"? This cannot be undone.`)) return;
    const i = section.cards.indexOf(card);
    if (i >= 0) section.cards.splice(i, 1);
    el.remove();
    markChanged();
    updateSidebarCount(section.id);
    toast(`Deleted "${card.name}"`);
  });

  return el;
}

// ---- Drinks section ----

function renderDrinksSection(section) {
  const main = document.getElementById('adminMain');
  main.innerHTML = `
    <h2 class="admin-section-title">${esc(section.icon)} ${esc(section.title)}</h2>
    <p class="admin-section-note">Edit drink names and prices below. Each group matches a subheading on the menu.</p>
    <div id="drinksEditor"></div>`;

  const container = document.getElementById('drinksEditor');

  section.subgroups.forEach((sg, sgIdx) => {
    const div = document.createElement('div');
    div.className = 'drinks-admin-section';
    const headingHTML = sg.heading
      ? `<div class="drinks-admin-heading">${esc(sg.heading)}</div>` : '';
    const noteHTML = sg.note
      ? `<div class="drinks-admin-note">${esc(sg.note)}</div>` : '';

    div.innerHTML = `${headingHTML}${noteHTML}`;

    sg.cards.forEach((card, cIdx) => {
      const row = document.createElement('div');
      row.className = 'drink-row';

      const priceVal = typeof card.price === 'string' ? card.price : card.price.toFixed(2);

      row.innerHTML = `
        <input type="text" class="drink-name-input" value="${esc(card.name)}" placeholder="Drink name" />
        <input type="text" class="drink-price-input" value="${esc(priceVal)}" placeholder="e.g. 2.50" />
        <button class="btn-admin btn-danger btn-sm drink-del-btn" title="Delete">✕</button>`;

      row.querySelector('.drink-name-input').addEventListener('input', e => {
        card.name = e.target.value;
        markChanged();
      });
      row.querySelector('.drink-price-input').addEventListener('input', e => {
        const raw = e.target.value.replace('€', '').trim();
        card.price = isNaN(parseFloat(raw)) ? raw : parseFloat(raw);
        markChanged();
      });
      row.querySelector('.drink-del-btn').addEventListener('click', () => {
        if (!confirm(`Delete "${card.name}"?`)) return;
        sg.cards.splice(cIdx, 1);
        row.remove();
        markChanged();
        updateSidebarCount(section.id);
        toast(`Deleted "${card.name}"`);
      });

      div.appendChild(row);
    });

    // Add drink to this subgroup
    const addBtn = document.createElement('button');
    addBtn.className = 'btn-admin btn-outline btn-sm';
    addBtn.style.marginTop = '8px';
    addBtn.textContent = '+ Add Drink';
    addBtn.addEventListener('click', () => {
      const newCard = { id: 'drink-' + Date.now(), name: '', price: 0, featured: false, tags: [] };
      sg.cards.push(newCard);
      // Re-render drinks section
      renderDrinksSection(section);
      markChanged();
      updateSidebarCount(section.id);
    });

    div.appendChild(addBtn);
    container.appendChild(div);
  });
}

// ---- Bootstrap ----

if (checkLogin()) {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminShell').classList.add('visible');
  initAdmin();
}
