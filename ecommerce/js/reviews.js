/**
 * reviews.js — Hệ thống đánh giá sản phẩm
 * Lưu localStorage, hiển thị trên product-detail
 */

const Reviews = (() => {
  const KEY = 'shopvn_reviews';

  function getAll() {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  }

  function getForProduct(productId) {
    return (getAll()[productId] || []);
  }

  function addReview(productId, { rating, title, comment, userName }) {
    const all = getAll();
    if (!all[productId]) all[productId] = [];
    const review = {
      id:       Date.now(),
      rating:   parseInt(rating),
      title:    (title || '').trim(),
      comment:  comment.trim(),
      userName: (userName || 'Khách hàng ẩn danh').trim(),
      date:     new Date().toLocaleDateString('vi-VN'),
      verified: typeof Auth !== 'undefined' && Auth.isLoggedIn(),
    };
    all[productId].unshift(review);
    localStorage.setItem(KEY, JSON.stringify(all));
    return review;
  }

  function averageRating(productId) {
    const reviews = getForProduct(productId);
    if (!reviews.length) return null;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }

  /* ── Render review list ─────────────────────────── */
  function renderList(productId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const reviews = getForProduct(productId);
    if (!reviews.length) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="bi bi-chat-square-text fs-2 d-block mb-2 opacity-25"></i>
          Chưa có đánh giá nào. Hãy là người đầu tiên!
        </div>`;
      return;
    }

    const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
    container.innerHTML = reviews.map(r => `
      <div class="review-item border-bottom pb-3 mb-3 fade-in">
        <div class="d-flex align-items-start gap-3">
          <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
               style="width:38px;height:38px;font-size:.9rem">${r.userName.charAt(0).toUpperCase()}</div>
          <div class="flex-grow-1">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
              <div>
                <span class="fw-semibold me-2">${API.escapeHtml(r.userName)}</span>
                ${r.verified ? '<span class="badge bg-success-subtle text-success border border-success-subtle" style="font-size:.7rem"><i class="bi bi-check-circle me-1"></i>Đã mua hàng</span>' : ''}
              </div>
              <small class="text-muted"><i class="bi bi-clock me-1"></i>${r.date}</small>
            </div>
            <div class="text-warning mb-1" style="font-size:1rem;letter-spacing:.05em">${stars(r.rating)}</div>
            ${r.title ? `<div class="fw-semibold mb-1">${API.escapeHtml(r.title)}</div>` : ''}
            <p class="text-muted mb-0 small">${API.escapeHtml(r.comment)}</p>
          </div>
        </div>
      </div>`).join('');
  }

  /* ── Render write form ──────────────────────────── */
  function renderForm(productId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = typeof Auth !== 'undefined' ? Auth.current() : null;
    container.innerHTML = `
      <div class="card border-0 bg-light rounded-3 p-4">
        <h6 class="fw-bold mb-3"><i class="bi bi-pencil-square me-2 text-primary"></i>Viết đánh giá của bạn</h6>
        <form id="reviewForm" novalidate>
          <div class="mb-3">
            <label class="form-label fw-semibold">Họ tên</label>
            <input type="text" class="form-control" id="rv_name"
                   value="${user ? API.escapeHtml(user.fullName) : ''}"
                   placeholder="Nhập tên của bạn..." ${user ? 'readonly' : ''} required />
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Đánh giá <span class="text-danger">*</span></label>
            <div class="star-rating d-flex gap-1" id="starPicker" role="radiogroup" aria-label="Chọn số sao">
              ${[1,2,3,4,5].map(n => `
                <button type="button" class="star-btn" data-val="${n}" title="${n} sao"
                        style="background:none;border:none;cursor:pointer;font-size:1.8rem;color:#dee2e6;padding:0;transition:color .15s"
                        onmouseenter="hoverStars(${n})"
                        onmouseleave="resetStars()"
                        onclick="selectStar(${n})">★</button>`).join('')}
            </div>
            <input type="hidden" id="rv_rating" value="0" />
            <div id="rv_rating_err" class="text-danger small d-none">Vui lòng chọn số sao.</div>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Tiêu đề đánh giá</label>
            <input type="text" class="form-control" id="rv_title" placeholder="Tóm tắt ý kiến của bạn..." />
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Nội dung <span class="text-danger">*</span></label>
            <textarea class="form-control" id="rv_comment" rows="3"
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..." required></textarea>
            <div class="invalid-feedback">Vui lòng nhập nội dung đánh giá.</div>
          </div>
          <button type="submit" class="btn btn-primary px-4" id="rv_submit">
            <i class="bi bi-send me-2"></i>Gửi đánh giá
          </button>
        </form>
      </div>`;

    // Star interaction
    let selectedRating = 0;
    window.hoverStars = (n) => {
      document.querySelectorAll('.star-btn').forEach((b, i) => {
        b.style.color = i < n ? '#ffc107' : '#dee2e6';
      });
    };
    window.resetStars = () => {
      document.querySelectorAll('.star-btn').forEach((b, i) => {
        b.style.color = i < selectedRating ? '#ffc107' : '#dee2e6';
      });
    };
    window.selectStar = (n) => {
      selectedRating = n;
      document.getElementById('rv_rating').value = n;
      document.getElementById('rv_rating_err').classList.add('d-none');
      resetStars();
    };

    // Form submit
    document.getElementById('reviewForm').addEventListener('submit', e => {
      e.preventDefault();
      const rating  = parseInt(document.getElementById('rv_rating').value);
      const comment = document.getElementById('rv_comment').value.trim();
      const name    = document.getElementById('rv_name').value.trim();

      if (!rating) { document.getElementById('rv_rating_err').classList.remove('d-none'); return; }
      if (!comment) { document.getElementById('rv_comment').classList.add('is-invalid'); return; }

      const btn = document.getElementById('rv_submit');
      btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang gửi...';

      setTimeout(() => {
        addReview(productId, {
          rating,
          title:    document.getElementById('rv_title').value,
          comment,
          userName: name || 'Khách hàng ẩn danh',
        });
        showToast('<i class="bi bi-check-circle me-2"></i>Cảm ơn bạn đã đánh giá!', 'success');
        renderList(productId, 'reviewList');
        // Reset
        document.getElementById('reviewForm').reset();
        selectedRating = 0; resetStars();
        btn.disabled = false; btn.innerHTML = '<i class="bi bi-send me-2"></i>Gửi đánh giá';
      }, 700);
    });
  }

  /* ── Combined render: list + form ─────────────────── */
  function renderAll(productId) {
    // Render vào section reviews bên dưới (đầy đủ)
    renderList(productId, 'reviewList');
    renderForm(productId, 'reviewFormWrapper');

    // Render preview ngắn vào panel rating trong product detail
    const inlineEl = document.getElementById('inlineReviewList');
    if (inlineEl) {
      const reviews = getForProduct(productId);
      const stars   = n => '★'.repeat(n) + '☆'.repeat(5 - n);
      if (!reviews.length) {
        // Show default fake reviews from API rating data
        inlineEl.innerHTML = `
          <div class="border-bottom pb-3 mb-3">
            <div class="d-flex align-items-center gap-3 mb-1">
              <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width:36px;height:36px">N</div>
              <div><div class="fw-semibold small">Nguyễn Minh Tuấn</div><span class="text-warning small">★★★★★</span> <small class="text-muted">15/07/2026</small></div>
              <span class="ms-auto badge bg-success-subtle text-success border border-success-subtle small"><i class="bi bi-check-circle me-1"></i>Đã mua hàng</span>
            </div>
            <p class="text-muted small mb-0">Sản phẩm rất tốt, đúng như mô tả. Giao hàng nhanh, đóng gói cẩn thận!</p>
          </div>
          <div class="border-bottom pb-3 mb-3">
            <div class="d-flex align-items-center gap-3 mb-1">
              <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width:36px;height:36px">T</div>
              <div><div class="fw-semibold small">Trần Thị Lan</div><span class="text-warning small">★★★★</span><span class="text-muted small">★</span> <small class="text-muted">10/07/2026</small></div>
              <span class="ms-auto badge bg-success-subtle text-success border border-success-subtle small"><i class="bi bi-check-circle me-1"></i>Đã mua hàng</span>
            </div>
            <p class="text-muted small mb-0">Chất lượng ổn, giá hợp lý. Sẽ mua lại!</p>
          </div>
          <p class="text-muted text-center small mb-0"><a href="#reviewList" class="text-primary">Xem tất cả đánh giá →</a></p>`;
      } else {
        const preview = reviews.slice(0, 2);
        inlineEl.innerHTML = preview.map(r => `
          <div class="border-bottom pb-3 mb-3">
            <div class="d-flex align-items-center gap-3 mb-1">
              <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width:36px;height:36px">${r.userName.charAt(0).toUpperCase()}</div>
              <div>
                <div class="fw-semibold small">${API.escapeHtml(r.userName)}</div>
                <span class="text-warning small">${stars(r.rating)}</span>
                <small class="text-muted">${r.date}</small>
              </div>
              ${r.verified ? '<span class="ms-auto badge bg-success-subtle text-success border border-success-subtle small"><i class="bi bi-check-circle me-1"></i>Đã mua hàng</span>' : ''}
            </div>
            <p class="text-muted small mb-0">${API.escapeHtml(r.comment)}</p>
          </div>`).join('') +
          `<p class="text-muted text-center small mb-0"><a href="#reviewList" class="text-primary">Xem tất cả ${reviews.length} đánh giá →</a></p>`;
      }
    }
  }

  return { addReview, getForProduct, averageRating, renderList, renderForm, renderAll };
})();
