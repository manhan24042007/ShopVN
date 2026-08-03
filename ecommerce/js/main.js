/**
 * main.js — Logic trang chủ & chức năng chung
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Back to Top ──────────────────────────────────────────────
  const backBtn = document.createElement('button');
  backBtn.id        = 'backToTop';
  backBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
  backBtn.title     = 'Về đầu trang';
  document.body.appendChild(backBtn);

  window.addEventListener('scroll', () => {
    backBtn.classList.toggle('show', window.scrollY > 300);
  });
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── Search Form ───────────────────────────────────────────────
  const searchForm  = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  if (searchForm) {
    searchForm.addEventListener('submit', e => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    });
  }

  // ── Category Dropdown in Navbar ──────────────────────────────
  loadNavCategories();

  // ── Newsletter ────────────────────────────────────────────────
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      showToast(`<i class="bi bi-envelope-check me-2"></i>Đăng ký thành công! Cảm ơn ${emailInput.value}`, 'success');
      emailInput.value = '';
    });
  }

  // ── Homepage Sections ─────────────────────────────────────────
  if (document.getElementById('featuredProducts')) {
    loadFeaturedProducts();
    loadNewArrivals();
    loadCategoriesGrid();
  }

  // ── Checkout Page ─────────────────────────────────────────────
  if (document.getElementById('checkoutForm')) {
    initCheckoutPage();
  }
});

// ── Load navbar categories ───────────────────────────────────────
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
  } catch (err) {
    console.warn('Không tải được danh mục navbar:', err);
  }
}

// ── Homepage: Categories Grid ────────────────────────────────────
async function loadCategoriesGrid() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  try {
    const cats = await API.getAllCategories();
    grid.innerHTML = cats.map(cat => `
      <div class="col-6 col-md-3">
        <a href="products.html?category=${encodeURIComponent(cat)}" class="category-card d-block border rounded-xl overflow-hidden shadow-sm slide-in-up">
          <div class="category-img" style="background:${API.getCategoryColor(cat)}">
            <i class="bi ${API.getCategoryIcon(cat)} text-white" style="font-size:3.5rem;opacity:.9"></i>
          </div>
          <div class="category-name text-dark">${API.getCategoryLabel(cat)}</div>
        </a>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<div class="col-12 text-center text-muted">Không tải được danh mục.</div>';
  }
}

// ── Homepage: Featured Products ──────────────────────────────────
async function loadFeaturedProducts() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;
  // Show skeleton
  container.innerHTML = API.buildSkeletonCards(8);
  try {
    const products = await API.getLimitedProducts(8);
    container.innerHTML = products.map(p => `
      <div class="col-6 col-md-4 col-lg-3">${API.buildProductCard(p)}</div>
    `).join('');
    applyWishlistState();
  } catch (err) {
    container.innerHTML = '<div class="col-12 text-center text-danger"><i class="bi bi-exclamation-circle me-2"></i>Không tải được sản phẩm.</div>';
  }
}

// ── Homepage: New Arrivals ───────────────────────────────────────
async function loadNewArrivals() {
  const container = document.getElementById('newArrivals');
  if (!container) return;
  container.innerHTML = API.buildSkeletonCards(4);
  try {
    const products = await API.getSortedProducts('desc');
    container.innerHTML = products.slice(0, 4).map(p => `
      <div class="col-6 col-md-3">${API.buildProductCard(p)}</div>
    `).join('');
    applyWishlistState();
  } catch (err) {
    container.innerHTML = '<div class="col-12 text-center text-danger">Lỗi tải sản phẩm.</div>';
  }
}

// ── Wishlist State Restore ───────────────────────────────────────
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

// ── Checkout Page Initialization ─────────────────────────────────
function initCheckoutPage() {
  Cart.renderCheckoutItems();
  updateCartUI();

  // Shipping method change
  document.querySelectorAll('input[name="shipping"]').forEach(radio => {
    radio.addEventListener('change', function () {
      document.querySelectorAll('.shipping-option').forEach(el => el.classList.remove('selected-option'));
      this.closest('.shipping-option').classList.add('selected-option');
      const costs = { standard: 0, express: 5, sameday: 10 };
      Cart.updateCheckoutSummary(costs[this.value] || 0);
    });
  });

  // Payment method change
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', function () {
      document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected-option'));
      this.closest('.payment-option').classList.add('selected-option');
      const cardFields = document.getElementById('cardFields');
      if (cardFields) cardFields.classList.toggle('d-none', this.value !== 'card');
    });
  });

  // Card number formatting
  const cardNumInput = document.getElementById('cardNumber');
  if (cardNumInput) {
    cardNumInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    });
  }

  const cardExpInput = document.getElementById('cardExpiry');
  if (cardExpInput) {
    cardExpInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2');
    });
  }

  // Checkout form submit
  const form = document.getElementById('checkoutForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        this.classList.add('was-validated');
        const firstInvalid = this.querySelector(':invalid');
        if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const btn = document.getElementById('placeOrderBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';

      // Simulate API call
      setTimeout(() => {
        const orderCode = 'SVN' + Date.now().toString().slice(-8).toUpperCase();
        document.getElementById('orderCode').textContent = orderCode;
        Cart.clear();
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
      }, 1800);
    });
  }
}

// ── Shared: update cart badge ────────────────────────────────────
function updateCartUI() {
  Cart.updateCartUI();
}
