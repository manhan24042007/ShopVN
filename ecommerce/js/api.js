/**
 * api.js — Wrapper cho FakeStore API
 * Base URL: https://fakestoreapi.com
 */

const API = (() => {
  const BASE_URL = 'https://fakestoreapi.com';

  // ---------- Helpers ----------

  async function request(endpoint) {
    // Serve from sessionStorage cache when available
    if (typeof Cache !== 'undefined') {
      const cached = Cache.get(endpoint);
      if (cached) return cached;
    }
    
    // AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`API Error ${res.status}: ${endpoint}`);
      const data = await res.json();
      if (typeof Cache !== 'undefined') Cache.set(endpoint, data);
      return data;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  function formatPrice(usd) {
    return `$${Number(usd).toFixed(2)}`;
  }

  function formatPriceVND(usd) {
    const vnd = Math.round(usd * 25000);
    return vnd.toLocaleString('vi-VN') + ' ₫';
  }

  function renderStars(rating) {
    const full  = Math.floor(rating);
    const half  = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      '<span class="stars-filled">' + '★'.repeat(full) + (half ? '½' : '') + '</span>' +
      '<span class="stars-empty">' + '★'.repeat(empty) + '</span>'
    );
  }

  function getCategoryBadgeClass(category) {
    const map = {
      'electronics':       'badge-electronics',
      'jewelery':          'badge-jewelery',
      "men's clothing":    'badge-mens',
      "women's clothing":  'badge-womens',
    };
    return map[category] || 'bg-secondary text-white';
  }

  function getCategoryLabel(category) {
    const map = {
      'electronics':       'Điện tử',
      'jewelery':          'Trang sức',
      "men's clothing":    'Thời trang Nam',
      "women's clothing":  'Thời trang Nữ',
    };
    return map[category] || category;
  }

  function getCategoryIcon(category) {
    const map = {
      'electronics':       'bi-phone',
      'jewelery':          'bi-gem',
      "men's clothing":    'bi-gender-male',
      "women's clothing":  'bi-gender-female',
    };
    return map[category] || 'bi-tag';
  }

  function getCategoryColor(category) {
    const map = {
      'electronics':       'linear-gradient(135deg,#4facfe,#00f2fe)',
      'jewelery':          'linear-gradient(135deg,#f093fb,#f5576c)',
      "men's clothing":    'linear-gradient(135deg,#43e97b,#38f9d7)',
      "women's clothing":  'linear-gradient(135deg,#fa709a,#fee140)',
    };
    return map[category] || 'linear-gradient(135deg,#667eea,#764ba2)';
  }

  // ---------- Public API Methods ----------

  async function getAllProducts() {
    return request('/products');
  }

  async function getProductById(id) {
    return request(`/products/${id}`);
  }

  async function getProductsByCategory(category) {
    return request(`/products/category/${encodeURIComponent(category)}`);
  }

  async function getAllCategories() {
    return request('/products/categories');
  }

  async function getLimitedProducts(limit = 8) {
    return request(`/products?limit=${limit}`);
  }

  async function getSortedProducts(sort = 'asc') {
    return request(`/products?sort=${sort}`);
  }

  // ---------- Product Card Template ----------

  function buildProductCard(product, isListView = false) {
    const discount = Math.floor(Math.random() * 20) + 5;
    const oldPrice = (product.price * (1 + discount / 100)).toFixed(2);
    const catClass = getCategoryBadgeClass(product.category);
    const catLabel = getCategoryLabel(product.category);

    if (isListView) {
      return `
        <div class="card product-card list-card d-flex flex-row fade-in" data-id="${product.id}">
          <div class="card-img-wrapper" style="width:180px;min-width:180px">
            <img src="${product.image}" alt="${escapeHtml(product.title)}" loading="lazy" referrerpolicy="no-referrer" />
            <span class="badge-category ${catClass}">${catLabel}</span>
          </div>
          <div class="card-body d-flex flex-column justify-content-between p-3">
            <div>
              <a href="product-detail.html?id=${product.id}" class="product-title d-block">${escapeHtml(product.title)}</a>
              <div class="d-flex align-items-center gap-2 my-2">
                <div class="rating-stars">${renderStars(product.rating.rate)}</div>
                <span class="rating-count">(${product.rating.count})</span>
              </div>
              <p class="text-muted small mb-0 text-truncate-2">${escapeHtml(product.description)}</p>
            </div>
            <div class="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
              <div>
                <span class="product-price">${formatPrice(product.price)}</span>
                <span class="product-price-old ms-2">${formatPrice(oldPrice)}</span>
                <span class="badge bg-danger ms-1">-${discount}%</span>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary wishlist-btn" onclick="toggleWishlist(${product.id}, this)" title="Yêu thích">
                  <i class="bi bi-heart"></i>
                </button>
                <a href="product-detail.html?id=${product.id}" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-eye me-1"></i>Xem
                </a>
                <button class="btn btn-sm btn-primary" onclick="Cart.add(${product.id}, '${escapeAttr(product.title)}', ${product.price}, '${product.image}')">
                  <i class="bi bi-cart-plus me-1"></i>Thêm
                </button>
              </div>
            </div>
          </div>
        </div>`;
    }

    return `
      <div class="card product-card fade-in" data-id="${product.id}">
        <div class="card-img-wrapper">
          <img src="${product.image}" alt="${escapeHtml(product.title)}" loading="lazy" referrerpolicy="no-referrer" />
          <span class="badge-category ${catClass}">${catLabel}</span>
          <span class="badge-sale badge bg-danger">-${discount}%</span>
          <div class="card-overlay">
            <button class="overlay-btn" onclick="event.stopPropagation();toggleWishlist(${product.id}, this)" title="Yêu thích">
              <i class="bi bi-heart"></i>
            </button>
            <button class="overlay-btn" onclick="event.stopPropagation();Cart.add(${product.id}, '${escapeAttr(product.title)}', ${product.price}, '${product.image}')" title="Thêm vào giỏ">
              <i class="bi bi-cart-plus"></i>
            </button>
            <button class="overlay-btn" onclick="event.stopPropagation();typeof Compare!=='undefined'&&Compare.toggle(${product.id},'${escapeAttr(product.title)}')" data-compare-id="${product.id}" title="So sánh">
              <i class="bi bi-arrow-left-right"></i>
            </button>
          </div>
        </div>
        <div class="card-body d-flex flex-column">
          <a href="product-detail.html?id=${product.id}" class="product-title">${escapeHtml(product.title)}</a>
          <div class="d-flex align-items-center gap-1 my-1">
            <div class="rating-stars">${renderStars(product.rating.rate)}</div>
            <span class="rating-count">(${product.rating.count})</span>
          </div>
          <div class="mt-auto d-flex align-items-center justify-content-between flex-wrap gap-1">
            <div>
              <span class="product-price">${formatPrice(product.price)}</span><br>
              <span class="product-price-old">${formatPrice(oldPrice)}</span>
            </div>
            <button class="btn btn-sm btn-primary" onclick="Cart.add(${product.id}, '${escapeAttr(product.title)}', ${product.price}, '${product.image}')">
              <i class="bi bi-cart-plus me-1"></i>Thêm
            </button>
          </div>
        </div>
      </div>`;
  }

  // ---------- Utility ----------

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  // Wishlist helper (global)
  window.toggleWishlist = function(id, btn) {
    let wl = JSON.parse(localStorage.getItem('shopvn_wishlist') || '[]');
    const idx = wl.indexOf(id);
    const icon = btn.querySelector('i');
    if (idx === -1) {
      wl.push(id);
      icon.classList.replace('bi-heart', 'bi-heart-fill');
      btn.classList.add('active');
      showToast('Đã thêm vào danh sách yêu thích!', 'success');
    } else {
      wl.splice(idx, 1);
      icon.classList.replace('bi-heart-fill', 'bi-heart');
      btn.classList.remove('active');
      showToast('Đã xóa khỏi danh sách yêu thích.', 'secondary');
    }
    localStorage.setItem('shopvn_wishlist', JSON.stringify(wl));
  };

  window.showToast = function(msg, type = 'success') {
    const el   = document.getElementById('toastMsg');
    const body = document.getElementById('toastBody');
    if (!el || !body) return;
    el.className = `toast align-items-center text-bg-${type} border-0`;
    body.innerHTML = msg;
    bootstrap.Toast.getOrCreateInstance(el, { delay: 3000 }).show();
  };

  // ---------- Skeleton Cards ----------
  function buildSkeletonCards(n = 8) {
    return Array(n).fill(`
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card border-0 shadow-sm overflow-hidden h-100">
          <div class="skeleton" style="height:200px"></div>
          <div class="card-body">
            <div class="skeleton mb-2" style="height:14px;border-radius:6px"></div>
            <div class="skeleton mb-3" style="height:14px;width:70%;border-radius:6px"></div>
            <div class="skeleton" style="height:20px;width:50%;border-radius:6px"></div>
          </div>
        </div>
      </div>`).join('');
  }

  // Expose
  return {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    getAllCategories,
    getLimitedProducts,
    getSortedProducts,
    buildProductCard,
    buildSkeletonCards,
    formatPrice,
    formatPriceVND,
    renderStars,
    getCategoryLabel,
    getCategoryIcon,
    getCategoryColor,
    getCategoryBadgeClass,
    escapeHtml,
  };
})();
