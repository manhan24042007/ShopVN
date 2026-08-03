/**
 * products.js — Trang danh sách sản phẩm
 */

document.addEventListener('DOMContentLoaded', () => {
  const params    = new URLSearchParams(window.location.search);
  const urlCat    = params.get('category') || '';
  const urlSearch = params.get('search')   || '';

  // State
  let allProducts      = [];
  let filteredProducts = [];
  let currentPage      = 1;
  const PAGE_SIZE      = 12;
  let isListView       = false;
  let activeCategory   = urlCat;
  let minPrice         = null;
  let maxPrice         = null;
  let minRating        = 0;
  let sortOrder        = 'default';

  // ── Init ─────────────────────────────────────────────────────
  init();

  async function init() {
    updateBreadcrumb();
    await loadCategories();
    await loadProducts();
    bindEvents();
    updateNavCategories();
  }

  // ── Load Categories Sidebar ──────────────────────────────────
  async function loadCategories() {
    const filterEl = document.getElementById('categoryFilter');
    if (!filterEl) return;
    try {
      const cats = await API.getAllCategories();
      const all  = [{ key: '', label: 'Tất cả sản phẩm', count: null }];
      cats.forEach(c => all.push({ key: c, label: API.getCategoryLabel(c), count: null }));

      // Get counts
      const countMap = {};
      const products = await API.getAllProducts();
      products.forEach(p => {
        countMap[p.category] = (countMap[p.category] || 0) + 1;
      });

      filterEl.innerHTML = all.map(item => `
        <div class="category-filter-item ${item.key === activeCategory ? 'active' : ''}"
             data-category="${item.key}">
          <span>${item.label}</span>
          <span class="badge bg-light text-muted">${item.key ? (countMap[item.key] || 0) : products.length}</span>
        </div>
      `).join('');

      filterEl.querySelectorAll('.category-filter-item').forEach(el => {
        el.addEventListener('click', () => {
          activeCategory = el.dataset.category;
          filterEl.querySelectorAll('.category-filter-item').forEach(x => x.classList.remove('active'));
          el.classList.add('active');
          currentPage = 1;
          applyFilters();
          updateBreadcrumb();
          // Update URL
          const newParams = new URLSearchParams();
          if (activeCategory) newParams.set('category', activeCategory);
          history.replaceState(null, '', `products.html${newParams.toString() ? '?' + newParams : ''}`);
        });
      });
    } catch (err) {
      filterEl.innerHTML = '<small class="text-danger">Lỗi tải danh mục</small>';
    }
  }

  // ── Load Products ─────────────────────────────────────────────
  async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = `<div class="col-12 text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2 text-muted">Đang tải sản phẩm...</p>
    </div>`;

    // Show skeleton immediately
    grid.innerHTML = API.buildSkeletonCards ? API.buildSkeletonCards(12) : grid.innerHTML;

    try {
      if (activeCategory) {
        allProducts = await API.getProductsByCategory(activeCategory);
      } else {
        allProducts = await API.getAllProducts();
      }

      // Apply URL search filter
      if (urlSearch) {
        const q = urlSearch.toLowerCase();
        allProducts = allProducts.filter(p =>
          p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
        document.getElementById('pageTitle').textContent = `Kết quả: "${urlSearch}"`;
      }

      applyFilters();
    } catch (err) {
      grid.innerHTML = `<div class="col-12">
        <div class="alert alert-danger d-flex align-items-center gap-3">
          <i class="bi bi-exclamation-triangle-fill fs-4"></i>
          <div>
            <strong>Không thể tải sản phẩm.</strong><br>
            <small>Kiểm tra kết nối mạng và thử lại.</small>
          </div>
          <button class="btn btn-sm btn-danger ms-auto" onclick="location.reload()">Thử lại</button>
        </div>
      </div>`;
    }
  }

  // ── Apply All Filters & Sort ──────────────────────────────────
  function applyFilters() {
    filteredProducts = [...allProducts];

    // Category (already filtered via API, but for all-products case):
    if (activeCategory && !document.querySelector(`.category-filter-item[data-category="${activeCategory}"]`)) {
      // skip — already done in API call
    }

    // Price
    if (minPrice !== null) filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
    if (maxPrice !== null) filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);

    // Rating
    if (minRating > 0) filteredProducts = filteredProducts.filter(p => p.rating.rate >= minRating);

    // Sort
    switch (sortOrder) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        filteredProducts.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
      case 'name-asc':
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    currentPage = 1;
    renderPage();
  }

  // ── Render Current Page ───────────────────────────────────────
  function renderPage() {
    const grid      = document.getElementById('productsGrid');
    const countEl   = document.getElementById('productCount');
    const titleEl   = document.getElementById('pageTitle');

    const total  = filteredProducts.length;
    const start  = (currentPage - 1) * PAGE_SIZE;
    const end    = Math.min(start + PAGE_SIZE, total);
    const paged  = filteredProducts.slice(start, end);

    // Title & count
    if (!urlSearch) {
      titleEl.textContent = activeCategory ? API.getCategoryLabel(activeCategory) : 'Tất cả sản phẩm';
    }
    countEl.textContent = `${total} sản phẩm (${start + 1}-${end})`;

    if (paged.length === 0) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="empty-state">
            <i class="bi bi-search"></i>
            <h5>Không tìm thấy sản phẩm nào</h5>
            <p class="text-muted">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            <button class="btn btn-outline-primary" id="clearFiltersEmpty">Xóa bộ lọc</button>
          </div>
        </div>`;
      document.getElementById('clearFiltersEmpty')?.addEventListener('click', clearFilters);
      renderPagination(0);
      return;
    }

    if (isListView) {
      grid.className = 'row g-3 products-grid-list';
      grid.innerHTML = paged.map(p => `
        <div class="col-12 fade-in">${API.buildProductCard(p, true)}</div>
      `).join('');
    } else {
      grid.className = 'row g-3';
      grid.innerHTML = paged.map(p => `
        <div class="col-6 col-md-4 col-lg-4 fade-in">${API.buildProductCard(p)}</div>
      `).join('');
    }

    applyWishlistState();
    renderPagination(total);
  }

  // ── Pagination ────────────────────────────────────────────────
  function renderPagination(total) {
    const ul         = document.getElementById('pagination');
    if (!ul) return;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) { ul.innerHTML = ''; return; }

    let html = '';

    // Prev
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}"><i class="bi bi-chevron-left"></i></a>
    </li>`;

    // Pages
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`;
      } else if (Math.abs(i - currentPage) === 2) {
        html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
      }
    }

    // Next
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}"><i class="bi bi-chevron-right"></i></a>
    </li>`;

    ul.innerHTML = html;
    ul.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const page = parseInt(link.dataset.page);
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          currentPage = page;
          renderPage();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  // ── Clear Filters ─────────────────────────────────────────────
  function clearFilters() {
    minPrice       = null;
    maxPrice       = null;
    minRating      = 0;
    activeCategory = '';
    sortOrder      = 'default';

    const minEl = document.getElementById('priceMin');
    const maxEl = document.getElementById('priceMax');
    if (minEl) minEl.value = '';
    if (maxEl) maxEl.value = '';

    document.querySelectorAll('input[name="rating"]').forEach(r => { r.checked = r.value === '0'; });
    const sortSel = document.getElementById('sortSelect');
    if (sortSel) sortSel.value = 'default';

    document.querySelectorAll('.category-filter-item').forEach(el => {
      el.classList.toggle('active', el.dataset.category === '');
    });

    loadProducts();
    history.replaceState(null, '', 'products.html');
  }

  // ── Bind Events ───────────────────────────────────────────────
  function bindEvents() {
    // Sort
    const sortSel = document.getElementById('sortSelect');
    if (sortSel) {
      sortSel.addEventListener('change', () => {
        sortOrder = sortSel.value;
        currentPage = 1;
        applyFilters();
      });
    }

    // Grid / List toggle
    document.getElementById('gridView')?.addEventListener('click', function () {
      isListView = false;
      this.classList.add('active');
      document.getElementById('listView')?.classList.remove('active');
      renderPage();
    });
    document.getElementById('listView')?.addEventListener('click', function () {
      isListView = true;
      this.classList.add('active');
      document.getElementById('gridView')?.classList.remove('active');
      renderPage();
    });

    // Price filter
    document.getElementById('applyPrice')?.addEventListener('click', () => {
      const minVal = parseFloat(document.getElementById('priceMin').value);
      const maxVal = parseFloat(document.getElementById('priceMax').value);
      minPrice = isNaN(minVal) ? null : minVal;
      maxPrice = isNaN(maxVal) ? null : maxVal;
      currentPage = 1;
      applyFilters();
    });

    // Rating filter
    document.querySelectorAll('input[name="rating"]').forEach(radio => {
      radio.addEventListener('change', function () {
        minRating   = parseFloat(this.value);
        currentPage = 1;
        applyFilters();
      });
    });

    // Clear filters
    document.getElementById('clearFilters')?.addEventListener('click', clearFilters);

    // Search form — redirect to search.html
    const searchForm  = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    if (searchForm && searchInput) {
      if (urlSearch) searchInput.value = urlSearch;
      searchForm.addEventListener('submit', e => {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
      });
    }
  }

  // ── Breadcrumb ────────────────────────────────────────────────
  function updateBreadcrumb() {
    const el = document.getElementById('breadcrumbCurrent');
    if (!el) return;
    if (urlSearch)      el.textContent = `Tìm kiếm: "${urlSearch}"`;
    else if (activeCategory) el.textContent = API.getCategoryLabel(activeCategory);
    else                el.textContent = 'Tất cả sản phẩm';
  }

  // ── Navbar categories ─────────────────────────────────────────
  async function updateNavCategories() {
    const dropdown = document.getElementById('categoryDropdown');
    if (!dropdown) return;
    try {
      const cats = await API.getAllCategories();
      dropdown.innerHTML = `<li><a class="dropdown-item" href="products.html">Tất cả sản phẩm</a></li><li><hr class="dropdown-divider"></li>`;
      cats.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="products.html?category=${encodeURIComponent(cat)}">
          <i class="bi ${API.getCategoryIcon(cat)} me-2 text-primary"></i>${API.getCategoryLabel(cat)}
        </a>`;
        dropdown.appendChild(li);
      });
    } catch (_) {}
  }

  // ── Wishlist restore ──────────────────────────────────────────
  function applyWishlistState() {
    const wl = JSON.parse(localStorage.getItem('shopvn_wishlist') || '[]');
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const card = btn.closest('[data-id]');
      if (!card) return;
      const id = parseInt(card.dataset.id);
      if (wl.includes(id)) {
        btn.classList.add('active');
        const icon = btn.querySelector('i');
        if (icon) icon.classList.replace('bi-heart', 'bi-heart-fill');
      }
    });
  }
});
