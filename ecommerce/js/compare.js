/**
 * compare.js — So sánh sản phẩm (tối đa 4)
 */

const Compare = (() => {
  const KEY = 'shopvn_compare';
  const MAX = 4;

  function getIds() { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  function saveIds(ids) { localStorage.setItem(KEY, JSON.stringify(ids)); updateBar(); }

  function toggle(id, title) {
    let ids = getIds();
    if (ids.includes(id)) {
      ids = ids.filter(i => i !== id);
      showToast(`Đã bỏ "${title.substring(0,30)}..." khỏi so sánh.`, 'secondary');
    } else {
      if (ids.length >= MAX) { showToast(`Chỉ so sánh tối đa ${MAX} sản phẩm.`, 'warning'); return; }
      ids.push(id);
      showToast(`<i class="bi bi-check-circle me-2"></i>Đã thêm vào so sánh!`, 'success');
    }
    saveIds(ids);
    updateButtons();
  }

  function remove(id) {
    saveIds(getIds().filter(i => i !== id));
    if (document.getElementById('compareBody')) renderComparePage();
  }

  function clear() { localStorage.removeItem(KEY); updateBar(); updateButtons(); }

  function has(id) { return getIds().includes(id); }

  // ── Floating Compare Bar ─────────────────────────────
  function updateBar() {
    const ids = getIds();
    let bar = document.getElementById('compareBar');

    if (ids.length === 0) { if (bar) bar.remove(); return; }

    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'compareBar';
      bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:1050;background:linear-gradient(90deg,#0d6efd,#0a58ca);color:#fff;padding:.75rem 1rem;box-shadow:0 -4px 20px rgba(0,0,0,.2);transition:transform .3s;';
      document.body.appendChild(bar);
    }

    bar.innerHTML = `
      <div class="container d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-arrow-left-right me-1"></i>
          <span class="fw-semibold">${ids.length}/${MAX} sản phẩm đang so sánh</span>
          <div class="d-flex gap-1" id="compareBarSlots">
            ${[...Array(MAX)].map((_, i) => `
              <div class="bg-white bg-opacity-25 rounded d-flex align-items-center justify-content-center" style="width:32px;height:32px;font-size:.7rem;font-weight:600">
                ${i < ids.length ? `<span class="text-white">${i+1}</span>` : '<span class="opacity-50">+</span>'}
              </div>`).join('')}
          </div>
        </div>
        <div class="d-flex gap-2">
          <a href="compare.html" class="btn btn-light btn-sm fw-semibold px-3"><i class="bi bi-arrow-left-right me-1"></i>So sánh ngay</a>
          <button class="btn btn-outline-light btn-sm px-3" onclick="Compare.clear()"><i class="bi bi-x me-1"></i>Xóa</button>
        </div>
      </div>`;

    // Also inject a floating compare button on non-compare pages so users always have a way to view compare
    let fab = document.getElementById('compareFab');
    const isComparePage = !!document.getElementById('compareBody');
    if (!isComparePage) {
      if (!fab) {
        fab = document.createElement('a');
        fab.id = 'compareFab';
        fab.href = 'compare.html';
        fab.className = 'btn btn-primary shadow-lg d-flex align-items-center justify-content-center';
        fab.style.cssText = 'position:fixed;bottom:90px;right:20px;z-index:1049;border-radius:50px;padding:.65rem 1.1rem;font-weight:600;gap:.5rem';
        fab.title = 'Xem so sánh';
        fab.innerHTML = `<i class="bi bi-arrow-left-right fs-5"></i><span class="badge bg-danger rounded-pill ms-1" id="compareFabCount">${ids.length}</span>`;
        document.body.appendChild(fab);
      } else {
        const c = document.getElementById('compareFabCount');
        if (c) c.textContent = ids.length;
      }
    } else if (fab) {
      fab.remove();
    }
  }

  function updateButtons() {
    const ids = getIds();
    document.querySelectorAll('[data-compare-id]').forEach(btn => {
      const id = parseInt(btn.dataset.compareId);
      const inList = ids.includes(id);
      btn.classList.toggle('active', inList);
      btn.title = inList ? 'Bỏ khỏi so sánh' : 'Thêm vào so sánh';
      const ic = btn.querySelector('i');
      if (ic) { ic.classList.toggle('bi-arrow-left-right', !inList); ic.classList.toggle('bi-check-all', inList); }
    });
  }

  // ── Compare Page Render ──────────────────────────────
  async function renderComparePage() {
    const loadEl = document.getElementById('loadingCompare');
    const emptyEl = document.getElementById('emptyCompare');
    const tableWrap = document.getElementById('compareTableWrap');
    const body = document.getElementById('compareBody');
    if (!body) return;

    const ids = getIds();
    if (ids.length === 0) {
      if (loadEl) loadEl.classList.add('d-none');
      if (emptyEl) emptyEl.classList.remove('d-none');
      if (tableWrap) tableWrap.style.display = 'none';
      return;
    }

    // Show how many products we expect (helps debug stuck spinners)
    if (loadEl) loadEl.querySelector('p').textContent = `Đang tải ${ids.length} sản phẩm...`;

    const hideLoading = () => { if (loadEl) loadEl.classList.add('d-none'); };

    // Try fetching individual products; if API fails, fall back to cached `/products` list
    let productsMap = {};

    async function fetchWithFallback() {
      const results = await Promise.allSettled(ids.map(id => API.getProductById(id)));
      const fulfilled = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failedIds = ids.filter((_, i) => results[i].status !== 'fulfilled');

      if (failedIds.length === 0) return fulfilled;

      // Try fallback: load full /products list (often cached, 1 request)
      let all = null;
      try { all = await API.getAllProducts(); } catch {}

      const fromList = failedIds
        .map(id => (all || []).find(p => p.id === id))
        .filter(Boolean);

      return [...fulfilled, ...fromList];
    }

    try {
      const products = await fetchWithFallback();
      hideLoading();
      if (emptyEl) emptyEl.classList.add('d-none');
      if (tableWrap) tableWrap.style.display = 'block';

      if (products.length === 0) {
        if (body) body.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle me-2"></i>Không tải được sản phẩm nào. <a href="products.html">Thử lại</a></td></tr>`;
        return;
      }

      // Helper: highlight best value
      const minPrice = Math.min(...products.map(p => p.price));
      const maxRating = Math.max(...products.map(p => p.rating.rate));

      const makeRow = (label, vals) => `
        <tr>
          <td class="row-label text-nowrap">${label}</td>
          ${vals.map(v => `<td>${v}</td>`).join('')}
        </tr>`;

      // Image row
      const imgRow = `<tr>
        <td class="row-label"></td>
        ${products.map(p => `
          <td class="text-center position-relative">
            <div class="position-relative d-inline-block">
              <img referrerpolicy="no-referrer" src="${API.escapeHtml(p.image)}" alt="${API.escapeHtml(p.title)}" class="compare-img" />
              <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-content-center" style="width:28px;height:28px"
                      onclick="Compare.remove(${p.id})" title="Xóa khỏi so sánh">
                <i class="bi bi-x" style="font-size:1rem"></i>
              </button>
            </div>
          </td>`).join('')}
      </tr>`;

      body.innerHTML = imgRow
        + makeRow('Tên sản phẩm', products.map(p => `<a href="product-detail.html?id=${p.id}" class="fw-semibold">${API.escapeHtml(p.title)}</a>`))
        + makeRow('Danh mục', products.map(p => `<span class="badge ${API.getCategoryBadgeClass(p.category)}">${API.getCategoryLabel(p.category)}</span>`))
        + makeRow('Giá', products.map(p => `<span class="product-price">${API.formatPrice(p.price)}</span>${p.price === minPrice ? ' <span class="best-value">Rẻ nhất</span>' : ''}`))
        + makeRow('Đánh giá', products.map(p => `<span class="text-warning">★</span> ${p.rating.rate.toFixed(1)} ${p.rating.rate === maxRating ? ' <span class="best-value">Cao nhất</span>' : ''} <small class="text-muted">(${p.rating.count})</small>`))
        + makeRow('Mô tả', products.map(p => `<p class="text-muted small mb-0">${API.escapeHtml(p.description.substring(0,120))}...</p>`))
        + `<tr><td class="row-label">Hành động</td>${products.map(p => `
          <td>
            <button class="btn btn-primary btn-sm w-100 mb-2" onclick="Cart.add(${p.id},'${p.title.replace(/'/g,"\\'")}',${p.price},'${p.image}')">
              <i class="bi bi-cart-plus me-1"></i>Thêm vào giỏ
            </button>
            <a href="product-detail.html?id=${p.id}" class="btn btn-outline-secondary btn-sm w-100">
              <i class="bi bi-eye me-1"></i>Xem chi tiết
            </a>
          </td>`).join('')}</tr>`;
    } catch(err) {
      hideLoading();
      if (body) body.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle me-2"></i>Không tải được sản phẩm. <a href="products.html">Thử lại</a></td></tr>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateBar();
    if (document.getElementById('compareBody')) renderComparePage();
  });

  return { toggle, remove, clear, has, getIds, updateBar, updateButtons };
})();

