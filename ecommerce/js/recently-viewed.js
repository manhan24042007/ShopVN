/**
 * recently-viewed.js — Theo dõi và hiển thị sản phẩm đã xem gần đây
 * Lưu vào localStorage, hiển thị dưới dạng carousel trên product-detail
 */

const RecentlyViewed = (() => {
  const KEY     = 'shopvn_recently_viewed';
  const MAX     = 10;

  /* ── Core ─────────────────────────────────────────── */
  function add(product) {
    let items = get();
    // Remove if already exists (move to front)
    items = items.filter(i => i.id !== product.id);
    items.unshift({
      id:    product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating,
    });
    items = items.slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function get() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  /* ── Render: compact horizontal strip ─────────────── */
  function renderStrip(containerId, excludeId = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = get().filter(p => p.id !== excludeId).slice(0, 6);
    if (!items.length) { container.closest('section')?.classList.add('d-none'); return; }

    container.innerHTML = `
      <div class="recently-strip d-flex gap-3 overflow-auto pb-2" style="scroll-snap-type:x mandatory;scrollbar-width:thin">
        ${items.map(p => {
          const disc = Math.floor(Math.random() * 20) + 5;
          const old  = (p.price * (1 + disc/100)).toFixed(2);
          return `
          <a href="product-detail.html?id=${p.id}"
             class="recently-item text-decoration-none flex-shrink-0"
             style="width:130px;scroll-snap-align:start">
            <div class="bg-light rounded-3 d-flex align-items-center justify-content-center mb-2 overflow-hidden"
                 style="height:100px;padding:.5rem">
              <img referrerpolicy="no-referrer" src="${API.escapeHtml(p.image)}" alt="${API.escapeHtml(p.title)}"
                   style="max-height:90px;object-fit:contain" loading="lazy" />
            </div>
            <div class="text-dark" style="font-size:.75rem;font-weight:600;
                 display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.3">${API.escapeHtml(p.title)}</div>
            <div class="text-primary fw-bold mt-1" style="font-size:.82rem">${API.formatPrice(p.price)}</div>
          </a>`;
        }).join('')}
      </div>`;
  }

  /* ── Render: grid (for homepage) ─────────────────── */
  function renderGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = get().slice(0, 4);
    if (!items.length) { container.closest('section')?.classList.add('d-none'); return; }

    container.innerHTML = items.map(p => `
      <div class="col-6 col-md-3">${API.buildProductCard(p)}</div>
    `).join('');
  }

  /* ── Auto-init: Record current product ─────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-render strip on product-detail page
    if (document.getElementById('recentlyViewedStrip')) {
      const params = new URLSearchParams(window.location.search);
      const id     = parseInt(params.get('id'));
      renderStrip('recentlyViewedStrip', id);
    }
    // Auto-render grid on homepage
    if (document.getElementById('recentlyViewedGrid')) {
      renderGrid('recentlyViewedGrid');
    }
  });

  return { add, get, clear, renderStrip, renderGrid };
})();

