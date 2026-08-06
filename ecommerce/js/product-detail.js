/**
 * product-detail.js — Trang chi tiết sản phẩm
 */

document.addEventListener('DOMContentLoaded', async () => {

  const params = new URLSearchParams(window.location.search);
  const id     = parseInt(params.get('id'));

  if (!id || isNaN(id)) {
    window.location.href = 'products.html';
    return;
  }

  await loadProduct(id);
  await loadRelatedProducts(id);
  loadNavCategories();
  updateCartBadge();

  // Search form
  const searchForm  = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  if (searchForm) {
    searchForm.addEventListener('submit', e => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    });
  }
});

// ── Load Main Product ──────────────────────────────────────────
async function loadProduct(id) {
  const container = document.getElementById('productDetailContainer');
  if (!container) return;

  try {
    const p = await API.getProductById(id);
    if (!p) {
      container.innerHTML = `
        <div class="alert alert-danger text-center py-5">
          <i class="bi bi-exclamation-triangle-fill fs-1 d-block mb-3"></i>
          <h5>Không tìm thấy sản phẩm</h5>
          <p class="text-muted">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
          <a href="products.html" class="btn btn-primary">← Quay lại danh sách</a>
        </div>`;
      return;
    }
    const catLabel = API.getCategoryLabel(p.category);
    const catClass = API.getCategoryBadgeClass(p.category);
    const discount = Math.floor(Math.random() * 20) + 5;
    const oldPrice = (p.price * (1 + discount / 100)).toFixed(2);

    // Breadcrumb
    const bcEl = document.getElementById('breadcrumbProduct');
    if (bcEl) bcEl.textContent = p.title.substring(0, 50) + (p.title.length > 50 ? '...' : '');

    // Page title + OG tags
    document.title = `${p.title} - ShopVN`;
    const setMeta = (id, val) => { const el = document.getElementById(id); if (el) el.setAttribute('content', val); };
    setMeta('ogTitle', `${p.title} - ShopVN`);
    setMeta('ogDesc', p.description.substring(0, 160));
    setMeta('ogImage', p.image);

    // Stars detail
    const fullStars  = Math.floor(p.rating.rate);
    const hasHalf    = p.rating.rate - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    const starsHtml  = '<i class="bi bi-star-fill stars-filled"></i>'.repeat(fullStars)
      + (hasHalf ? '<i class="bi bi-star-half stars-filled"></i>' : '')
      + '<i class="bi bi-star stars-empty"></i>'.repeat(emptyStars);

    // Rating breakdown (simulated)
    const ratingBreakdown = generateRatingBreakdown(p.rating.rate, p.rating.count);

    container.innerHTML = `
      <div class="row g-5 fade-in">

        <!-- Image -->
        <div class="col-lg-5">
          <div class="product-detail-img-wrapper shadow-sm">
            <img referrerpolicy="no-referrer" src="${p.image}" alt="${API.escapeHtml(p.title)}" id="mainProductImg" />
          </div>
          <!-- Thumbnails (demo) -->
          <div class="d-flex gap-2 mt-3 justify-content-center">
            ${[p.image, p.image, p.image].map((img, i) => `
              <div class="thumb-item border rounded p-1 cursor-pointer ${i === 0 ? 'border-primary' : ''}"
                   style="width:64px;height:64px;display:flex;align-items:center;justify-content:center"
                   onclick="document.getElementById('mainProductImg').src='${img}'; document.querySelectorAll('.thumb-item').forEach(t=>t.classList.remove('border-primary')); this.classList.add('border-primary')">
                <img referrerpolicy="no-referrer" src="${img}" style="max-width:100%;max-height:100%;object-fit:contain" alt="thumb ${i+1}" />
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Details -->
        <div class="col-lg-7">

          <!-- Category badge -->
          <span class="badge ${catClass} product-detail-category mb-2">${catLabel}</span>

          <h1 class="fs-3 fw-bold mb-3 lh-sm">${API.escapeHtml(p.title)}</h1>

          <!-- Rating -->
          <div class="d-flex align-items-center gap-3 mb-3 flex-wrap">
            <div class="d-flex align-items-center gap-1 fs-5">${starsHtml}</div>
            <span class="fw-semibold">${p.rating.rate.toFixed(1)}</span>
            <span class="text-muted">(${p.rating.count} đánh giá)</span>
            <span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>Còn hàng</span>
          </div>

          <!-- Price -->
          <div class="mb-4">
            <span class="product-detail-price">${API.formatPrice(p.price)}</span>
            <span class="text-muted text-decoration-line-through fs-5 ms-3">${API.formatPrice(oldPrice)}</span>
            <span class="badge bg-danger ms-2 fs-6">-${discount}%</span>
          </div>

          <!-- Description -->
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase mb-2" style="font-size:.8rem;letter-spacing:.05em;color:#888">Mô tả sản phẩm</h6>
            <p class="text-muted lh-lg mb-0">${API.escapeHtml(p.description)}</p>
          </div>

          <hr />

          <!-- Quantity -->
          <div class="mb-4">
            <label class="form-label fw-semibold mb-2">Số lượng</label>
            <div class="d-flex align-items-center gap-3 flex-wrap">
              <div class="qty-control">
                <button type="button" id="qtyDecBtn">−</button>
                <input type="number" id="qtyInput" value="1" min="1" max="99" />
                <button type="button" id="qtyIncBtn">+</button>
              </div>
              <span class="text-muted small">Còn <strong>50</strong> sản phẩm</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex gap-3 flex-wrap mb-4">
            <button class="btn btn-primary btn-lg px-5" id="addToCartBtn">
              <i class="bi bi-cart-plus me-2"></i>Thêm vào giỏ
            </button>
            <button class="btn btn-warning btn-lg px-5" id="buyNowBtn">
              <i class="bi bi-lightning-fill me-2"></i>Mua ngay
            </button>
            <button class="btn btn-outline-secondary btn-lg wishlist-btn" id="wishlistBtn" title="Yêu thích">
              <i class="bi bi-heart"></i>
            </button>
            <button class="btn btn-outline-secondary btn-lg" title="Chia sẻ" onclick="shareProduct('${API.escapeHtml(p.title)}')">
              <i class="bi bi-share"></i>
            </button>
          </div>

          <!-- Meta -->
          <div class="bg-light rounded-xl p-3">
            <div class="row g-2 text-sm">
              <div class="col-6">
                <span class="text-muted">ID Sản phẩm:</span>
                <strong class="ms-1">#${p.id}</strong>
              </div>
              <div class="col-6">
                <span class="text-muted">Danh mục:</span>
                <strong class="ms-1">${catLabel}</strong>
              </div>
              <div class="col-6">
                <i class="bi bi-truck text-primary me-1"></i>
                <span class="text-muted">Giao hàng miễn phí</span>
              </div>
              <div class="col-6">
                <i class="bi bi-arrow-repeat text-success me-1"></i>
                <span class="text-muted">Đổi trả 30 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating Details -->
      <div class="row mt-5 g-4">
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center py-4">
              <div class="display-3 fw-bold text-warning">${p.rating.rate.toFixed(1)}</div>
              <div class="fs-4 my-2">${starsHtml}</div>
              <p class="text-muted">${p.rating.count} đánh giá</p>
              <div class="d-flex flex-column gap-2">
                ${ratingBreakdown.map((r, i) => `
                  <div class="rating-bar-item">
                    <span style="width:1.5rem">${5 - i}★</span>
                    <div class="rating-bar-track">
                      <div class="rating-bar-fill" style="width:${r}%"></div>
                    </div>
                    <span style="width:2rem" class="text-muted text-end">${r}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white fw-bold py-3">
              <i class="bi bi-chat-square-text me-2 text-primary"></i>Đánh giá từ khách hàng
            </div>
            <div class="card-body" id="inlineReviewList">
              <div class="text-center py-3 text-muted">
                <div class="spinner-border spinner-border-sm text-primary"></div>
                <span class="ms-2">Đang tải đánh giá...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // ── Quantity controls ──────────────────────────────────────
    const qtyInput  = document.getElementById('qtyInput');
    const qtyDecBtn = document.getElementById('qtyDecBtn');
    const qtyIncBtn = document.getElementById('qtyIncBtn');

    qtyDecBtn.addEventListener('click', () => {
      const val = parseInt(qtyInput.value);
      if (val > 1) qtyInput.value = val - 1;
    });
    qtyIncBtn.addEventListener('click', () => {
      const val = parseInt(qtyInput.value);
      if (val < 99) qtyInput.value = val + 1;
    });
    qtyInput.addEventListener('change', () => {
      let v = parseInt(qtyInput.value);
      if (isNaN(v) || v < 1) v = 1;
      if (v > 99) v = 99;
      qtyInput.value = v;
    });

    // ── Add to Cart ────────────────────────────────────────────
    document.getElementById('addToCartBtn').addEventListener('click', () => {
      const qty = parseInt(qtyInput.value) || 1;
      Cart.add(p.id, p.title, p.price, p.image, qty);
    });

    // ── Buy Now ────────────────────────────────────────────────
    document.getElementById('buyNowBtn').addEventListener('click', () => {
      const qty = parseInt(qtyInput.value) || 1;
      Cart.add(p.id, p.title, p.price, p.image, qty);
      window.location.href = 'cart.html';
    });

    // ── Init Reviews ───────────────────────────────────────────
    if (typeof Reviews !== 'undefined') {
      Reviews.renderAll(p.id);
    }

    // ── Back-in-stock / Low stock badge ────────────────────────
    const stockCount = Math.floor(Math.random() * 15) + 1;
    const stockBadgeContainer = document.querySelector('.product-detail-img-wrapper')?.closest('.col-lg-5');
    if (stockCount <= 5 && stockBadgeContainer) {
      const badge = document.createElement('div');
      badge.className = 'text-center mt-2';
      badge.innerHTML = `<span class="badge-low-stock"><i class="bi bi-exclamation-triangle me-1"></i>Chỉ còn ${stockCount} sản phẩm!</span>`;
      stockBadgeContainer.appendChild(badge);
    }

    // ── Wishlist ───────────────────────────────────────────────
    const wishBtn = document.getElementById('wishlistBtn');
    const wl = JSON.parse(localStorage.getItem('shopvn_wishlist') || '[]');
    if (wl.includes(p.id)) {
      wishBtn.classList.add('active');
      wishBtn.querySelector('i').classList.replace('bi-heart', 'bi-heart-fill');
    }
    wishBtn.addEventListener('click', () => toggleWishlist(p.id, wishBtn));

  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger text-center py-5">
        <i class="bi bi-exclamation-triangle-fill fs-1 d-block mb-3"></i>
        <h5>Không tìm thấy sản phẩm</h5>
        <p class="text-muted">${err.message}</p>
        <a href="products.html" class="btn btn-primary">← Quay lại danh sách</a>
      </div>`;
  }
}

// ── Load Related Products ──────────────────────────────────────
async function loadRelatedProducts(currentId) {
  const container = document.getElementById('relatedProducts');
  if (!container) return;
  try {
    const product  = await API.getProductById(currentId);
    const related  = await API.getProductsByCategory(product.category);
    const filtered = related.filter(p => p.id !== currentId).slice(0, 4);

    if (filtered.length === 0) {
      container.innerHTML = '<div class="col-12 text-muted text-center">Không có sản phẩm liên quan.</div>';
      return;
    }

    container.innerHTML = filtered.map(p => `
      <div class="col-6 col-md-3 fade-in">${API.buildProductCard(p)}</div>
    `).join('');
  } catch (_) {
    container.innerHTML = '';
  }
}

// ── Navbar categories ──────────────────────────────────────────
async function loadNavCategories() {
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

function updateCartBadge() {
  Cart.updateCartUI();
}

// ── Share Product ──────────────────────────────────────────────
function shareProduct(title) {
  if (navigator.share) {
    navigator.share({ title, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('<i class="bi bi-clipboard-check me-2"></i>Đã sao chép link sản phẩm!', 'info'))
      .catch(() => showToast('Không thể sao chép link.', 'danger'));
  }
}

// ── Generate simulated rating breakdown ──────────────────────
function generateRatingBreakdown(avgRating, count) {
  const base = avgRating / 5;
  let percents = [
    Math.round(base * 60),
    Math.round(base * 25),
    Math.round((1 - base) * 15 + 5),
    Math.round((1 - base) * 10),
    Math.round((1 - base) * 5),
  ];
  const sum  = percents.reduce((a, b) => a + b, 0);
  percents   = percents.map(p => Math.round((p / sum) * 100));
  return percents;
}

