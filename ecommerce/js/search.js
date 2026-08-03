/**
 * search.js — Tìm kiếm nâng cao
 * - Autocomplete / gợi ý khi gõ
 * - Highlight từ khóa trong kết quả
 * - Lịch sử tìm kiếm (localStorage)
 */

const Search = (() => {
  const HISTORY_KEY = 'shopvn_search_history';
  const MAX_HISTORY = 8;
  let allProducts   = [];
  let debounceTimer = null;

  /* ── History ─────────────────────────────────────── */
  function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  }
  function addHistory(q) {
    if (!q.trim()) return;
    let h = getHistory().filter(i => i.toLowerCase() !== q.toLowerCase());
    h.unshift(q.trim());
    h = h.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  }
  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }

  /* ── Highlight ───────────────────────────────────── */
  function highlight(text, query) {
    if (!query) return API.escapeHtml(text);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return API.escapeHtml(text).replace(
      new RegExp(`(${escaped})`, 'gi'),
      '<mark class="search-highlight">$1</mark>'
    );
  }

  /* ── Dropdown ────────────────────────────────────── */
  function buildDropdown(input) {
    let dropdown = document.getElementById('searchDropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'searchDropdown';
      dropdown.className = 'search-dropdown shadow-sm border rounded-3 bg-white';
      dropdown.style.cssText = `
        position:absolute; top:calc(100% + 4px); left:0; right:0;
        z-index:1060; max-height:400px; overflow-y:auto; display:none;
      `;
      input.closest('form, .input-group').style.position = 'relative';
      input.closest('form, .input-group').appendChild(dropdown);
    }
    return dropdown;
  }

  function showDropdown(input, html) {
    const dd = buildDropdown(input);
    dd.innerHTML = html;
    dd.style.display = 'block';
  }

  function hideDropdown(input) {
    const dd = document.getElementById('searchDropdown');
    if (dd) dd.style.display = 'none';
  }

  /* ── Render suggestions ──────────────────────────── */
  function renderSuggestions(input, query) {
    const dd = buildDropdown(input);

    if (!query.trim()) {
      const history = getHistory();
      if (!history.length) { dd.style.display = 'none'; return; }

      dd.style.display = 'block';
      dd.innerHTML = `
        <div class="px-3 py-2 d-flex align-items-center justify-content-between border-bottom">
          <small class="text-muted fw-semibold"><i class="bi bi-clock-history me-1"></i>Tìm kiếm gần đây</small>
          <button class="btn btn-link btn-sm p-0 text-danger" id="clearHistoryBtn">Xóa</button>
        </div>
        ${history.map(h => `
          <div class="search-suggestion-item px-3 py-2 d-flex align-items-center gap-2 cursor-pointer"
               onclick="Search.selectSuggestion(this,'${h.replace(/'/g,"\\'")}')" role="option">
            <i class="bi bi-clock text-muted flex-shrink-0"></i>
            <span>${API.escapeHtml(h)}</span>
          </div>`).join('')}`;

      dd.querySelector('#clearHistoryBtn')?.addEventListener('click', e => {
        e.stopPropagation();
        clearHistory();
        dd.style.display = 'none';
      });
      return;
    }

    const q = query.toLowerCase();
    const matches = allProducts
      .filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 6);

    if (!matches.length) {
      dd.style.display = 'block';
      dd.innerHTML = `<div class="px-3 py-3 text-muted small text-center">
        <i class="bi bi-search me-1"></i>Không tìm thấy "<strong>${API.escapeHtml(query)}</strong>"
      </div>`;
      return;
    }

    dd.style.display = 'block';
    dd.innerHTML = `
      <div class="px-3 py-2 border-bottom">
        <small class="text-muted fw-semibold"><i class="bi bi-search me-1"></i>Gợi ý tìm kiếm</small>
      </div>
      ${matches.map(p => `
        <a href="product-detail.html?id=${p.id}"
           class="search-suggestion-item px-3 py-2 d-flex align-items-center gap-3 text-decoration-none text-dark"
           onclick="Search.addHistory('${p.title.replace(/'/g,"\\'")}')">
          <img referrerpolicy="no-referrer" src="${p.image}" alt="" style="width:36px;height:36px;object-fit:contain;background:#f8f9fa;border-radius:6px;padding:2px;flex-shrink:0" />
          <div class="flex-grow-1 min-w-0">
            <div class="small fw-semibold text-truncate">${highlight(p.title, query)}</div>
            <div style="font-size:.72rem" class="text-muted">${API.getCategoryLabel(p.category)} · ${API.formatPrice(p.price)}</div>
          </div>
        </a>`).join('')}
      <div class="px-3 py-2 border-top text-center">
        <a href="search.html?q=${encodeURIComponent(query)}" class="btn btn-sm btn-outline-primary w-100">
          <i class="bi bi-search me-1"></i>Xem tất cả kết quả cho "<strong>${API.escapeHtml(query)}</strong>"
        </a>
      </div>`;
  }

  /* ── Init ─────────────────────────────────────────── */
  function init(inputEl) {
    if (!inputEl) return;

    // Preload products for autocomplete (from cache if available)
    API.getAllProducts().then(products => { allProducts = products; }).catch(() => {});

    inputEl.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => renderSuggestions(inputEl, inputEl.value.trim()), 220);
    });

    inputEl.addEventListener('focus', () => {
      if (!inputEl.value.trim()) renderSuggestions(inputEl, '');
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('#searchForm') && !e.target.closest('.input-group')) {
        hideDropdown(inputEl);
      }
    });

    // Keyboard navigation
    inputEl.addEventListener('keydown', e => {
      const dd = document.getElementById('searchDropdown');
      if (!dd || dd.style.display === 'none') return;
      const items = dd.querySelectorAll('.search-suggestion-item');
      const active = dd.querySelector('.search-suggestion-item.active');
      let idx = Array.from(items).indexOf(active);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (active) active.classList.remove('active');
        idx = (idx + 1) % items.length;
        items[idx]?.classList.add('active');
        items[idx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (active) active.classList.remove('active');
        idx = (idx - 1 + items.length) % items.length;
        items[idx]?.classList.add('active');
        items[idx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && active) {
        e.preventDefault();
        active.click();
        hideDropdown(inputEl);
      } else if (e.key === 'Escape') {
        hideDropdown(inputEl);
      }
    });
  }

  /* ── Highlight results on search page ─────────────── */
  function highlightPageResults(query) {
    if (!query) return;
    document.querySelectorAll('.product-title').forEach(el => {
      el.innerHTML = highlight(el.textContent, query);
    });
  }

  function selectSuggestion(el, value) {
    const input = document.getElementById('searchInput');
    if (input) input.value = value;
    hideDropdown(input);
    addHistory(value);
    window.location.href = `search.html?q=${encodeURIComponent(value)}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('searchInput');
    if (input) init(input);
  });

  return { init, highlight, highlightPageResults, addHistory, selectSuggestion, getHistory };
})();

