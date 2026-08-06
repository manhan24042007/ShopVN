/**
 * footer-template.js
 * Inject footer đầy đủ + Live Chat + Flash Sale widget vào mọi trang
 * Chỉ cần include file này — không cần copy HTML vào từng trang
 */

(function () {

  /* ── Footer HTML ────────────────────────────────────────────── */
  const FOOTER_HTML = `
<a href="flash-sale.html" class="flash-sale-banner d-block text-decoration-none" aria-label="Flash Sale">
  <i class="bi bi-lightning-fill me-2"></i>
  FLASH SALE đang diễn ra — Giảm đến 70%! Nhanh tay kẻo hết
  <i class="bi bi-lightning-fill ms-2"></i>
</a>

<footer class="bg-dark text-white pt-5 pb-3 mt-auto footer-enhanced">
  <style>
    .footer-enhanced .footer-link       { color:#cfd4db!important; transition:color .2s,padding-left .2s }
    .footer-enhanced .footer-link:hover { color:#fff!important; padding-left:6px }
    .footer-enhanced h5,
    .footer-enhanced h6                 { color:#fff!important }
    .footer-enhanced .text-white-75     { color:rgba(255,255,255,.8)!important }
  </style>
  <div class="container">
    <div class="row g-4">

      <!-- Brand + Social + Live Chat -->
      <div class="col-lg-4">
        <h5 class="fw-bold mb-3">
          <i class="bi bi-bag-heart-fill me-2 text-primary"></i>ShopVN
        </h5>
        <p class="text-white-50">Nền tảng mua sắm trực tuyến hàng đầu Việt Nam. Hơn 2.5 triệu khách hàng tin dùng.</p>
        <div class="footer-social d-flex gap-2 mt-3 mb-4">
          <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
          <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
          <a href="#" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
          <a href="#" aria-label="Youtube"><i class="bi bi-youtube"></i></a>
          <a href="#" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>
        </div>
        <div class="footer-live-chat">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-chat-dots-fill fs-5"></i>
            <span class="fw-semibold">Hỗ trợ trực tuyến 24/7</span>
          </div>
          <div class="small mb-2" style="opacity:.8">Đội ngũ sẵn sàng hỗ trợ bạn mọi lúc</div>
          <button class="btn btn-light btn-sm fw-semibold px-3" onclick="toggleLiveChat()">
            <i class="bi bi-chat-dots me-1"></i>Chat ngay
          </button>
        </div>
      </div>

      <!-- Mua sắm -->
      <div class="col-6 col-lg-2">
        <h6 class="fw-bold mb-3">Mua sắm</h6>
        <ul class="list-unstyled">
          <li><a href="products.html"                        class="footer-link">Tất cả sản phẩm</a></li>
          <li><a href="flash-sale.html"                      class="footer-link text-danger fw-semibold"><i class="bi bi-lightning-fill me-1"></i>Flash Sale</a></li>
          <li><a href="products.html?category=electronics"   class="footer-link">Điện tử</a></li>
          <li><a href="products.html?category=jewelery"      class="footer-link">Trang sức</a></li>
          <li><a href="products.html?category=men's clothing"    class="footer-link">Nam giới</a></li>
          <li><a href="products.html?category=women's clothing"  class="footer-link">Nữ giới</a></li>
          <li><a href="wishlist.html"                        class="footer-link">Yêu thích</a></li>
          <li><a href="compare.html"                         class="footer-link">So sánh</a></li>
        </ul>
      </div>

      <!-- Hỗ trợ -->
      <div class="col-6 col-lg-2">
        <h6 class="fw-bold mb-3">Hỗ trợ</h6>
        <ul class="list-unstyled">
          <li><a href="faq.html"     class="footer-link">Câu hỏi thường gặp</a></li>
          <li><a href="orders.html"  class="footer-link">Theo dõi đơn hàng</a></li>
          <li><a href="return-policy.html"   class="footer-link">Chính sách đổi trả</a></li>
          <li><a href="payment-methods.html" class="footer-link">Phương thức thanh toán</a></li>
          <li><a href="about.html"   class="footer-link">Về chúng tôi</a></li>
          <li><a href="admin.html"   class="footer-link"><i class="bi bi-speedometer2 me-1"></i>Admin</a></li>
        </ul>
      </div>

      <!-- Liên hệ + App -->
      <div class="col-lg-4">
        <h6 class="fw-bold mb-3">Thông tin liên hệ</h6>
        <ul class="list-unstyled">
          <li class="mb-2 text-white-75"><i class="bi bi-geo-alt me-2 text-primary"></i>123 Đường ABC, Quận 1, TP.HCM</li>
          <li class="mb-2 text-white-75"><i class="bi bi-telephone me-2 text-primary"></i>1800 1234 (miễn phí)</li>
          <li class="mb-2 text-white-75"><i class="bi bi-envelope me-2 text-primary"></i>support@shopvn.com</li>
          <li class="mb-3 text-white-75"><i class="bi bi-clock me-2 text-primary"></i>8:00 – 22:00 (T2 – CN)</li>
        </ul>
        <div class="d-flex gap-2 flex-wrap">
          <a href="#" class="btn btn-outline-light btn-sm d-flex align-items-center gap-2">
            <i class="bi bi-apple fs-5"></i>
            <span>
              <div style="font-size:.6rem;opacity:.7">Tải về</div>
              <div style="font-size:.75rem;font-weight:600">App Store</div>
            </span>
          </a>
          <a href="#" class="btn btn-outline-light btn-sm d-flex align-items-center gap-2">
            <i class="bi bi-google-play fs-5"></i>
            <span>
              <div style="font-size:.6rem;opacity:.7">Tải về</div>
              <div style="font-size:.75rem;font-weight:600">Google Play</div>
            </span>
          </a>
        </div>
      </div>
    </div>

    <hr class="border-secondary mt-4" />

    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
      <p class="text-white-50 mb-0 small">
        &copy; 2026 ShopVN. All rights reserved.
        &nbsp;|&nbsp;<a href="faq.html"   class="text-white-50">FAQ</a>
        &nbsp;|&nbsp;<a href="about.html" class="text-white-50">Về chúng tôi</a>
      </p>

      <!-- Payment icons -->
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <span class="text-white-50 small me-1">Thanh toán qua:</span>

        <!-- Visa -->
        <div class="payment-icon-badge" title="Visa">
          <svg width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#1A1F71"/>
            <path d="M16.5 16.5H14L15.8 7.5H18.3L16.5 16.5Z" fill="#F7F7F7"/>
            <path d="M23.8 7.7C23.3 7.5 22.5 7.3 21.5 7.3C19.2 7.3 17.5 8.5 17.5 10.2C17.5 11.4 18.5 12.1 19.3 12.5C20.1 12.9 20.4 13.2 20.4 13.6C20.4 14.2 19.7 14.5 19 14.5C18 14.5 17.5 14.3 16.7 14L16.4 13.9L16.1 15.9C16.7 16.2 17.8 16.4 19 16.4C21.4 16.4 23.1 15.2 23.1 13.4C23.1 12.4 22.5 11.7 21.2 11.1C20.5 10.7 20.1 10.5 20.1 10.1C20.1 9.7 20.5 9.3 21.4 9.3C22.1 9.3 22.7 9.5 23.1 9.7L23.3 9.8L23.8 7.7Z" fill="#F7F7F7"/>
            <path d="M27.1 7.5H25.3C24.8 7.5 24.4 7.7 24.2 8.2L21 16.5H23.4L23.9 15H26.8L27.1 16.5H29.3L27.1 7.5ZM24.5 13.2C24.7 12.7 25.5 10.5 25.5 10.5L26 10.4L26.7 13.2H24.5Z" fill="#F7F7F7"/>
            <path d="M13.5 7.5L11.2 13.6L10.9 12.2C10.4 10.6 8.9 9 7.2 8.1L9.3 16.5H11.7L15.9 7.5H13.5Z" fill="#F7F7F7"/>
            <path d="M8.6 7.5H4.9L4.8 7.7C7.7 8.4 9.7 10.2 10.4 12.2L9.6 8.2C9.5 7.7 9.1 7.5 8.6 7.5Z" fill="#FAA61A"/>
          </svg>
        </div>

        <!-- Mastercard -->
        <div class="payment-icon-badge" title="Mastercard">
          <svg width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#252525"/>
            <circle cx="14" cy="12" r="7" fill="#EB001B"/>
            <circle cx="24" cy="12" r="7" fill="#F79E1B"/>
            <path d="M19 6.8C20.5 7.9 21.5 9.8 21.5 12C21.5 14.2 20.5 16.1 19 17.2C17.5 16.1 16.5 14.2 16.5 12C16.5 9.8 17.5 7.9 19 6.8Z" fill="#FF5F00"/>
          </svg>
        </div>

        <!-- PayPal -->
        <div class="payment-icon-badge" title="PayPal">
          <svg width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#F7F9FC"/>
            <path d="M14.5 7H18.8C20.6 7 21.8 8.1 21.5 9.9C21.1 12.1 19.5 13.2 17.7 13.2H16.5L15.8 17H13L14.5 7Z" fill="#003087"/>
            <path d="M16.8 8.8H20.1C21.2 8.8 21.8 9.4 21.6 10.5C21.3 12 20.1 12.8 18.8 12.8H17.8L17.2 16H15.1L16.8 8.8Z" fill="#009CDE"/>
            <path d="M22.5 9H26.8C28.6 9 29.8 10.1 29.5 11.9C29.1 14.1 27.5 15.2 25.7 15.2H24.5L23.8 19H21L22.5 9Z" fill="#009CDE"/>
          </svg>
        </div>

        <!-- MoMo -->
        <div class="payment-icon-badge" title="MoMo" style="background:#A50064">
          <span style="color:#fff;font-size:.72rem;font-weight:800;letter-spacing:-.5px">MoMo</span>
        </div>

        <!-- ZaloPay -->
        <div class="payment-icon-badge" title="ZaloPay" style="background:#0068FF">
          <span style="color:#fff;font-size:.6rem;font-weight:800;line-height:1.2;text-align:center">Zalo<br>Pay</span>
        </div>

        <!-- COD -->
        <div class="payment-icon-badge" title="Tiền mặt khi nhận hàng" style="background:#28a745">
          <span style="color:#fff;font-size:.65rem;font-weight:800">COD</span>
        </div>
      </div>
    </div>
  </div>
</footer>`;

  /* ── Live Chat + Flash Sale Widget HTML ─────────────────────── */
  const WIDGETS_HTML = `
<!-- Live Chat Widget -->
<div id="liveChatWidget" style="position:fixed!important;bottom:1.5rem;left:1.5rem;z-index:99999!important;display:block!important">
  <div id="liveChatPanel" style="position:absolute;bottom:62px;left:0;width:300px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.2);display:none;overflow:hidden">
    <div class="chat-header" style="background:linear-gradient(135deg,#0d6efd,#7c3aed);color:#fff;padding:.85rem 1rem;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:.6rem">
        <div style="width:32px;height:32px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center">
          <i class="bi bi-headset" style="color:#0d6efd"></i>
        </div>
        <div>
          <div style="font-weight:600;font-size:.85rem">Hỗ trợ ShopVN</div>
          <div style="font-size:.7rem;opacity:.8"><span style="color:#4ade80">●</span> Đang trực tuyến</div>
        </div>
      </div>
      <button onclick="toggleLiveChat()" style="background:none;border:none;color:#fff;cursor:pointer;padding:0" aria-label="Đóng">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    <div id="chatMessages" style="padding:.75rem 1rem;height:200px;overflow-y:auto;background:#f8f9ff;display:flex;flex-direction:column;gap:.5rem">
      <div style="max-width:82%;padding:.5rem .75rem;border-radius:12px;font-size:.82rem;background:#fff;border:1px solid #e9ecef;align-self:flex-start">Xin chào! Tôi là trợ lý ShopVN. Tôi có thể giúp gì cho bạn? 😊</div>
      <div style="max-width:82%;padding:.5rem .75rem;border-radius:12px;font-size:.82rem;background:#fff;border:1px solid #e9ecef;align-self:flex-start">Hỏi về đơn hàng, sản phẩm, hoặc chính sách nhé!</div>
    </div>
    <div style="padding:.65rem;border-top:1px solid #f0f0f0;display:flex;gap:.5rem">
      <input type="text" id="chatInput" class="form-control form-control-sm" placeholder="Nhập tin nhắn..." aria-label="Tin nhắn" />
      <button class="btn btn-primary btn-sm px-3" onclick="sendChatMsg()" aria-label="Gửi"><i class="bi bi-send"></i></button>
    </div>
  </div>
  <button id="liveChatBtn" onclick="toggleLiveChat()" aria-label="Mở Live Chat"
    style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#0d6efd,#7c3aed);color:#fff;border:none;box-shadow:0 4px 16px rgba(13,110,253,.4);display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;transition:transform .2s">
    <i class="bi bi-chat-dots-fill"></i>
  </button>
</div>

<!-- Flash Sale Floating Widget -->
<div id="flashSaleWidget" style="position:fixed!important;bottom:5.5rem;left:1.5rem;z-index:99998!important;display:block!important;animation:bounceIn .5s ease">
  <a href="flash-sale.html" aria-label="Xem Flash Sale"
    style="background:linear-gradient(135deg,#ff4757,#c0392b);border-radius:14px;padding:.6rem .9rem;color:#fff!important;font-weight:700;font-size:.82rem;box-shadow:0 4px 16px rgba(220,53,69,.4);text-decoration:none!important;display:flex;align-items:center;gap:.4rem;white-space:nowrap;transition:transform .2s,box-shadow .2s">
    <i class="bi bi-lightning-fill"></i>
    Flash Sale <span id="widgetCountdown" style="font-variant-numeric:tabular-nums">00:00:00</span>
  </a>
</div>`;

  /* ── Inject vào DOM ─────────────────────────────────────────── */
  function inject() {
    injectWidgetCSS();
    // 1. Thay footer cũ bằng footer đầy đủ
    const existingFooter = document.querySelector('footer');
    if (existingFooter && !existingFooter.classList.contains('footer-enhanced')) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = FOOTER_HTML;
      existingFooter.replaceWith(...wrapper.childNodes);
    } else if (!existingFooter) {
      document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
    }

    // 2. Inject widgets — luôn là con trực tiếp của <body>, append SAU cùng
    if (!document.getElementById('liveChatWidget')) {
      const widgetEl = document.createElement('div');
      widgetEl.id = 'globalWidgets';
      // style để đảm bảo container không can thiệp vào layout
      widgetEl.style.cssText = 'position:static;width:0;height:0;overflow:visible';
      widgetEl.innerHTML = WIDGETS_HTML;
      // Append vào body, không phải footer
      document.body.appendChild(widgetEl);
    }

    initWidgets();
    injectBackToTop();
    syncNavbar();
  }

  /* ── Sync Navbar — thêm Flash Sale nếu thiếu ──────────────── */
  function syncNavbar() {
    const navList = document.querySelector('.navbar-nav.me-auto');
    if (!navList) return;

    // Thêm Flash Sale link nếu chưa có
    if (!navList.querySelector('a[href="flash-sale.html"]')) {
      const li = document.createElement('li');
      li.className = 'nav-item';
      li.innerHTML = `<a class="nav-link fw-semibold" href="flash-sale.html"
        style="color:#ffc107!important">
        <i class="bi bi-lightning-fill me-1"></i>Sale
      </a>`;
      // Chèn sau "Sản phẩm"
      const productLink = navList.querySelector('a[href="products.html"]');
      if (productLink && productLink.parentElement) {
        productLink.parentElement.insertAdjacentElement('afterend', li);
      } else {
        navList.appendChild(li);
      }
    }
  }

  /* ── Back to Top button ─────────────────────────────────────── */
  function injectBackToTop() {
    if (document.getElementById('backToTop')) return;
    const btn = document.createElement('button');
    btn.id = 'backToTop';
    btn.setAttribute('aria-label', 'Về đầu trang');
    btn.title = 'Về đầu trang';
    btn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    btn.style.cssText = [
      'position:fixed!important',
      'bottom:2rem',
      'right:1.5rem',
      'z-index:99996!important',
      'width:44px',
      'height:44px',
      'border-radius:50%',
      'background:#0d6efd',
      'color:#fff',
      'border:none',
      'box-shadow:0 4px 12px rgba(13,110,253,.4)',
      'cursor:pointer',
      'font-size:1.1rem',
      'display:none',
      'align-items:center',
      'justify-content:center',
      'transition:transform .2s,opacity .2s',
    ].join(';');

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-3px)');
    btn.addEventListener('mouseleave', () => btn.style.transform = '');

    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    }, { passive: true });
  }

  /* ── Inject CSS cần thiết cho widgets ──────────────────────── */
  function injectWidgetCSS() {
    if (document.getElementById('widgetCSS')) return;
    const style = document.createElement('style');
    style.id = 'widgetCSS';
    style.textContent = `
      @keyframes bounceIn {
        0%   { opacity:0; transform:scale(.5) translateY(20px); }
        60%  { transform:scale(1.1) translateY(-4px); }
        100% { opacity:1; transform:scale(1) translateY(0); }
      }
      @keyframes slideUpPanel {
        from { opacity:0; transform:translateY(16px); }
        to   { opacity:1; transform:translateY(0); }
      }
      #liveChatBtn:hover { transform:scale(1.1) !important; }
      #flashSaleWidget a:hover { transform:scale(1.06) !important; }
      .chat-bubble-agent {
        max-width:82%; padding:.5rem .75rem; border-radius:12px;
        font-size:.82rem; background:#fff; border:1px solid #e9ecef;
        align-self:flex-start;
      }
      .chat-bubble-user {
        max-width:82%; padding:.5rem .75rem; border-radius:12px;
        font-size:.82rem; background:#0d6efd; color:#fff;
        align-self:flex-end;
      }
    `;
    document.head.appendChild(style);
  }
  function initWidgets() {
    // Flash Sale countdown
    const countdownEl = document.getElementById('widgetCountdown');
    if (countdownEl) {
      function tickCountdown() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const diff = Math.max(0, midnight - now);
        const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        countdownEl.textContent = `${h}:${m}:${s}`;
      }
      tickCountdown();
      setInterval(tickCountdown, 1000);
    }

    // Chat input Enter key
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendChatMsg();
      });
    }
  }

  /* ── Global functions (dùng ở mọi trang) ───────────────────── */
  window.toggleLiveChat = function () {
    const panel = document.getElementById('liveChatPanel');
    if (!panel) return;
    const isOpen = panel.style.display === 'block';
    panel.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
      panel.style.animation = 'slideUpPanel .25s ease';
      const input = document.getElementById('chatInput');
      if (input) setTimeout(() => input.focus(), 50);
    }
  };

  const BOT_REPLIES = [
    'Xin chào! Tôi đang xem lại thông tin để hỗ trợ bạn.',
    'Cảm ơn bạn đã liên hệ! Đội ngũ sẽ phản hồi trong vài phút.',
    'Bạn có thể gọi hotline 1800 1234 để được hỗ trợ nhanh hơn!',
    'Tôi đã ghi nhận câu hỏi. Nhân viên sẽ liên hệ lại sớm!',
    'Vui lòng cung cấp mã đơn hàng để tôi tra cứu giúp bạn.',
  ];
  let _botIdx = 0;

  window.sendChatMsg = function () {
    const input = document.getElementById('chatInput');
    const msgs  = document.getElementById('chatMessages');
    if (!input || !msgs) return;
    const text = input.value.trim();
    if (!text) return;
    // User bubble
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-bubble-user';
    userDiv.style.cssText = 'max-width:82%;padding:.5rem .75rem;border-radius:12px;font-size:.82rem;background:#0d6efd;color:#fff;align-self:flex-end';
    userDiv.textContent = text;
    msgs.appendChild(userDiv);
    input.value = '';
    msgs.scrollTop = msgs.scrollHeight;
    // Bot reply
    setTimeout(() => {
      const botDiv = document.createElement('div');
      botDiv.className = 'chat-bubble-agent';
      botDiv.style.cssText = 'max-width:82%;padding:.5rem .75rem;border-radius:12px;font-size:.82rem;background:#fff;border:1px solid #e9ecef;align-self:flex-start';
      botDiv.textContent = BOT_REPLIES[_botIdx % BOT_REPLIES.length];
      msgs.appendChild(botDiv);
      _botIdx++;
      msgs.scrollTop = msgs.scrollHeight;
    }, 800);
  };

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── Auto-run ───────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
