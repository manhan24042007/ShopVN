/**
 * minicart.js — Mini Cart Flyout trên navbar
 * Hiện dropdown giỏ hàng ngay trên thanh điều hướng
 */

const MiniCart = (() => {

  /* ── Build mini cart HTML ─────────────────────────── */
  function render() {
    const items = Cart.getItems();
    const sub   = Cart.subtotal();

    if (items.length === 0) {
      return `
        <div class="text-center py-4 px-3">
          <i class="bi bi-cart3 fs-2 text-muted d-block mb-2 opacity-50"></i>
          <p class="text-muted small mb-3">Giỏ hàng trống</p>
          <a href="products.html" class="btn btn-outline-primary btn-sm px-4">Mua sắm ngay</a>
        </div>`;
    }

    const itemsHtml = items.slice(0, 4).map(item => `
      <div class="mini-cart-item d-flex align-items-center gap-2 px-3 py-2 border-bottom">
        <a href="product-detail.html?id=${item.id}" class="flex-shrink-0">
          <img src="${API.escapeHtml(item.image)}" alt="${API.escapeHtml(item.title)}"
               referrerpolicy="no-referrer"
               onerror="this.onerror=null;this.style.opacity='.3'"
               style="width:48px;height:48px;object-fit:contain;background:#f8f9fa;border-radius:8px;padding:3px" />
        </a>
        <div class="flex-grow-1 min-w-0">
          <a href="product-detail.html?id=${item.id}"
             class="text-dark text-decoration-none d-block text-truncate"
             style="font-size:.82rem;font-weight:600;max-width:160px">${API.escapeHtml(item.title)}</a>
          <div style="font-size:.78rem" class="text-muted">
            ${item.qty} × <span class="text-primary fw-semibold">${API.formatPrice(item.price)}</span>
          </div>
        </div>
        <button class="btn btn-link btn-sm p-0 text-muted flex-shrink-0"
                onclick="Cart.remove(${item.id}); MiniCart.refresh()" aria-label="Xóa">
          <i class="bi bi-x-lg" style="font-size:.9rem"></i>
        </button>
      </div>`).join('');

    const moreHtml = items.length > 4
      ? `<div class="px-3 py-1 text-center text-muted" style="font-size:.78rem">
          +${items.length - 4} sản phẩm khác
         </div>` : '';

    return `
      <div class="mini-cart-header px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
        <span class="fw-semibold small"><i class="bi bi-cart3 me-1 text-primary"></i>${items.length} sản phẩm</span>
        <button class="btn btn-link btn-sm p-0 text-danger text-decoration-none" style="font-size:.78rem"
                onclick="Cart.clear(); MiniCart.refresh()">Xóa tất cả</button>
      </div>
      ${itemsHtml}${moreHtml}
      <div class="px-3 py-2 border-top">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="text-muted small">Tổng cộng</span>
          <span class="fw-bold text-primary">${API.formatPrice(sub)}</span>
        </div>
        <div class="d-flex gap-2">
          <a href="cart.html" class="btn btn-outline-primary btn-sm flex-grow-1">
            <i class="bi bi-cart me-1"></i>Xem giỏ
          </a>
          <a href="checkout.html" class="btn btn-primary btn-sm flex-grow-1">
            <i class="bi bi-credit-card me-1"></i>Thanh toán
          </a>
        </div>
      </div>`;
  }

  /* ── Inject into navbar ───────────────────────────── */
  function inject() {
    // Replace the plain cart <a> with a dropdown
    const cartBtn = document.querySelector('a[href="cart.html"].btn.btn-outline-light');
    if (!cartBtn) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'dropdown';
    wrapper.id = 'miniCartWrapper';

    cartBtn.classList.add('dropdown-toggle');
    cartBtn.setAttribute('data-bs-toggle', 'dropdown');
    cartBtn.setAttribute('data-bs-auto-close', 'outside');
    cartBtn.setAttribute('aria-expanded', 'false');
    cartBtn.setAttribute('aria-label', 'Giỏ hàng');
    cartBtn.style.cssText += ';text-decoration:none';
    cartBtn.parentNode.insertBefore(wrapper, cartBtn);
    wrapper.appendChild(cartBtn);

    const menu = document.createElement('div');
    menu.className = 'dropdown-menu dropdown-menu-end p-0 border-0 shadow';
    menu.style.cssText = 'min-width:300px;max-width:320px;border-radius:14px;overflow:hidden;margin-top:8px!important';
    menu.id = 'miniCartMenu';
    menu.innerHTML = render();
    wrapper.appendChild(menu);

    // Re-render on open
    cartBtn.addEventListener('show.bs.dropdown', () => {
      menu.innerHTML = render();
    });
  }

  /* ── Refresh ──────────────────────────────────────── */
  function refresh() {
    const menu = document.getElementById('miniCartMenu');
    if (menu) menu.innerHTML = render();
    Cart.updateCartUI();
  }

  document.addEventListener('DOMContentLoaded', inject);

  return { render, refresh, inject };
})();
