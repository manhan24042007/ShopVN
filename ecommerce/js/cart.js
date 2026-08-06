/**
 * cart.js — Cart Management (localStorage)
 */

const Cart = (() => {
  const KEY      = 'globalmart_cart';
  const DISCOUNT_CODES = {
    'SAVE10':   10,
    'SAVE20':   20,
    'FIRST50':  50,
  };

  // ---------- Core ----------

  function getItems() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }

  function saveItems(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateCartUI();
  }

  function add(id, title, price, image, qty = 1) {
    const items = getItems();
    const idx   = items.findIndex(i => i.id === id);
    if (idx > -1) {
      items[idx].qty += qty;
    } else {
      items.push({ id, title, price: Number(price), image, qty });
    }
    saveItems(items);
    showToast(`<i class="bi bi-check-circle me-2"></i>Đã thêm "${escapeHtml(title.substring(0, 30))}..." vào giỏ hàng!`, 'success');
  }

  function remove(id) {
    saveItems(getItems().filter(i => i.id !== id));
  }

  function updateQty(id, qty) {
    qty = parseInt(qty);
    if (isNaN(qty) || qty < 1) qty = 1;
    const items = getItems();
    const idx   = items.findIndex(i => i.id === id);
    if (idx > -1) {
      items[idx].qty = qty;
      saveItems(items);
    }
  }

  function clear() {
    localStorage.removeItem(KEY);
    updateCartUI();
  }

  function count() {
    return getItems().reduce((s, i) => s + i.qty, 0);
  }

  function subtotal() {
    return getItems().reduce((s, i) => s + i.price * i.qty, 0);
  }

  function applyDiscount(code) {
    const pct = DISCOUNT_CODES[code.toUpperCase()];
    if (!pct) return null;
    return { code: code.toUpperCase(), percent: pct, amount: subtotal() * pct / 100 };
  }

  // ---------- UI Update ----------

  function updateCartUI() {
    const el = document.getElementById('cartCount');
    if (el) {
      const c = count();
      el.textContent = c;
      el.style.display = c > 0 ? 'flex' : 'none';
    }
  }

  // ---------- Cart Page Render ----------

  function renderCartPage() {
    const items         = getItems();
    const emptyEl       = document.getElementById('cartEmpty');
    const contentEl     = document.getElementById('cartContent');
    const listEl        = document.getElementById('cartItemsList');
    const itemCountEl   = document.getElementById('cartItemCount');
    const subtotalEl    = document.getElementById('subtotal');
    const shippingEl    = document.getElementById('shippingFee');
    const totalEl       = document.getElementById('totalAmount');
    const checkoutBtn   = document.getElementById('checkoutBtn');

    if (!listEl) return;

    if (items.length === 0) {
      if (emptyEl)   emptyEl.classList.remove('d-none');
      if (contentEl) contentEl.classList.add('d-none');
      return;
    }

    if (emptyEl)   emptyEl.classList.add('d-none');
    if (contentEl) contentEl.classList.remove('d-none');

    // Render items
    listEl.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <a href="product-detail.html?id=${item.id}">
          <img src="${item.image}" alt="${API.escapeHtml(item.title)}"
               class="cart-item-img" referrerpolicy="no-referrer"
               onerror="this.onerror=null;this.style.opacity='.3'" />
        </a>
        <div class="flex-grow-1 min-width-0">
          <a href="product-detail.html?id=${item.id}" class="cart-item-title d-block">${API.escapeHtml(item.title)}</a>
          <div class="text-primary fw-bold">${API.formatPrice(item.price)}</div>
          <div class="cart-qty mt-2">
            <button onclick="Cart.updateQty(${item.id}, ${item.qty - 1}); Cart.renderCartPage();" aria-label="Decrease">
              <i class="bi bi-dash"></i>
            </button>
            <input type="number" value="${item.qty}" min="1" onchange="Cart.updateQty(${item.id}, this.value); Cart.renderCartPage();" />
            <button onclick="Cart.updateQty(${item.id}, ${item.qty + 1}); Cart.renderCartPage();" aria-label="Increase">
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </div>
        <div class="text-end">
          <div class="fw-bold text-dark">${API.formatPrice(item.price * item.qty)}</div>
          <button class="cart-item-remove mt-2" onclick="Cart.remove(${item.id}); Cart.renderCartPage();" aria-label="Remove">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Summary
    const sub      = subtotal();
    const shipping = sub >= 50 ? 0 : 9.99;
    const discount = getStoredDiscount();
    const total    = sub + shipping - discount;

    if (itemCountEl) itemCountEl.textContent = `${items.length} item(s)`;
    if (subtotalEl)  subtotalEl.textContent  = API.formatPrice(sub);
    if (shippingEl) {
      shippingEl.textContent = shipping === 0 ? 'Free' : API.formatPrice(shipping);
      shippingEl.className   = shipping === 0 ? 'text-success' : '';
    }

    const discRow = document.getElementById('discountRow');
    const discAmt = document.getElementById('discountAmount');
    if (discount > 0 && discRow && discAmt) {
      discRow.classList.remove('d-none');
      discAmt.textContent = `-${API.formatPrice(discount)}`;
    }

    if (totalEl)     totalEl.textContent    = API.formatPrice(Math.max(0, total));
    if (checkoutBtn) checkoutBtn.dataset.total = total;
  }

  function getStoredDiscount() {
    const d = sessionStorage.getItem('globalmart_discount');
    return d ? JSON.parse(d).amount : 0;
  }

  // ---------- Checkout page ----------

  function renderCheckoutItems() {
    const items  = getItems();
    const listEl = document.getElementById('checkoutItemsList');
    if (!listEl) return;

    if (items.length === 0) {
      window.location.href = 'cart.html';
      return;
    }

    listEl.innerHTML = items.map(item => `
      <div class="checkout-item">
        <div class="position-relative">
          <img src="${item.image}" alt="${API.escapeHtml(item.title)}"
               referrerpolicy="no-referrer"
               onerror="this.onerror=null;this.style.opacity='.3'" />
          <span class="checkout-item-qty">${item.qty}</span>
        </div>
        <div class="flex-grow-1 min-width-0">
          <div class="small fw-semibold text-truncate-2">${API.escapeHtml(item.title)}</div>
        </div>
        <div class="fw-bold text-primary text-nowrap">${API.formatPrice(item.price * item.qty)}</div>
      </div>
    `).join('');

    updateCheckoutSummary();
  }

  function updateCheckoutSummary(shippingCost = 0) {
    const sub      = subtotal();
    const discount = getStoredDiscount();
    const total    = sub + shippingCost - discount;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set('co-subtotal', API.formatPrice(sub));
    set('co-shipping', shippingCost === 0 ? 'Free' : API.formatPrice(shippingCost));
    set('co-total',    API.formatPrice(Math.max(0, total)));
    set('finalTotal',  API.formatPrice(Math.max(0, total)));

    const discRow = document.getElementById('co-discountRow');
    if (discount > 0 && discRow) {
      discRow.classList.remove('d-none');
      const discEl = document.getElementById('co-discount');
      if (discEl) discEl.textContent = `-${API.formatPrice(discount)}`;
    }
  }

  // ---------- Helpers ----------

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', updateCartUI);

  return {
    getItems,
    add,
    remove,
    updateQty,
    clear,
    count,
    subtotal,
    applyDiscount,
    updateCartUI,
    renderCartPage,
    renderCheckoutItems,
    updateCheckoutSummary,
    getStoredDiscount,
    DISCOUNT_CODES,
  };
})();
