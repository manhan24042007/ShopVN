// Footer & Live Chat shared component
(function () {
  const FOOTER_HTML = `
  <footer class="bg-dark text-white pt-5 pb-3 mt-auto footer-enhanced" style="--footer-link-color:#cfd4db">
    <style>
      .footer-enhanced .footer-link          { color:#cfd4db!important }
      .footer-enhanced .footer-link:hover    { color:#fff!important; padding-left:6px }
      .footer-enhanced h5,
      .footer-enhanced h6                    { color:#fff!important }
      .footer-enhanced .text-white-75        { color:rgba(255,255,255,.8)!important }
      .payment-icon-badge{width:38px;height:24px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;overflow:hidden}
    </style>
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-4">
          <h5 class="fw-bold mb-3"><i class="bi bi-bag-heart-fill me-2 text-primary"></i>ShopVN</h5>
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
            <div class="opacity-80 small mb-2">Đội ngũ sẵn sàng hỗ trợ bạn mọi lúc</div>
            <button class="btn btn-light btn-sm fw-semibold px-3" onclick="toggleLiveChat()">
              <i class="bi bi-chat-dots me-1"></i>Chat ngay
            </button>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <h6 class="fw-bold mb-3 text-white">Mua sắm</h6>
          <ul class="list-unstyled">
            <li><a href="products.html" class="footer-link">Tất cả sản phẩm</a></li>
            <li><a href="flash-sale.html" class="footer-link text-danger fw-semibold"><i class="bi bi-lightning-fill me-1"></i>Flash Sale</a></li>
            <li><a href="products.html?category=electronics" class="footer-link">Điện tử</a></li>
            <li><a href="products.html?category=jewelery" class="footer-link">Trang sức</a></li>
            <li><a href="wishlist.html" class="footer-link">Yêu thích</a></li>
            <li><a href="compare.html" class="footer-link">So sánh</a></li>
          </ul>
        </div>
        <div class="col-6 col-lg-2">
          <h6 class="fw-bold mb-3 text-white">Hỗ trợ</h6>
          <ul class="list-unstyled">
            <li><a href="faq.html" class="footer-link">Câu hỏi thường gặp</a></li>
            <li><a href="orders.html" class="footer-link">Theo dõi đơn hàng</a></li>
            <li><a href="return-policy.html" class="footer-link">Chính sách đổi trả</a></li>
            <li><a href="payment-methods.html" class="footer-link">Phương thức thanh toán</a></li>
            <li><a href="about.html" class="footer-link">Về chúng tôi</a></li>
            <li><a href="admin.html" class="footer-link"><i class="bi bi-speedometer2 me-1"></i>Admin</a></li>
          </ul>
        </div>
        <div class="col-lg-4">
          <h6 class="fw-bold mb-3 text-white">Thông tin liên hệ</h6>
          <ul class="list-unstyled">
            <li class="mb-2 text-white-75"><i class="bi bi-geo-alt me-2 text-primary"></i>123 Đường ABC, Quận 1, TP.HCM</li>
            <li class="mb-2 text-white-75"><i class="bi bi-telephone me-2 text-primary"></i>1800 1234 (miễn phí)</li>
            <li class="mb-2 text-white-75"><i class="bi bi-envelope me-2 text-primary"></i>support@shopvn.com</li>
            <li class="mb-3 text-white-75"><i class="bi bi-clock me-2 text-primary"></i>8:00 – 22:00 (T2 – CN)</li>
          </ul>
          <div class="d-flex gap-2 flex-wrap">
            <a href="#" class="btn btn-outline-light btn-sm d-flex align-items-center gap-2">
              <i class="bi bi-apple fs-5"></i><span><div style="font-size:.6rem;opacity:.7">Tải về</div><div style="font-size:.75rem;font-weight:600">App Store</div></span>
            </a>
            <a href="#" class="btn btn-outline-light btn-sm d-flex align-items-center gap-2">
              <i class="bi bi-google-play fs-5"></i><span><div style="font-size:.6rem;opacity:.7">Tải về</div><div style="font-size:.75rem;font-weight:600">Google Play</div></span>
            </a>
          </div>
        </div>
      </div>
      <hr class="border-secondary mt-4" />
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <p class="text-white-50 mb-0 small">&copy; 2026 ShopVN. All rights reserved. &nbsp;|&nbsp; <a href="faq.html" class="text-white-50">FAQ</a> &nbsp;|&nbsp; <a href="about.html" class="text-white-50">About</a></p>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <span class="text-white-50 small me-1">Thanh toán qua:</span>
          <div class="payment-icon-badge" title="Visa"><svg width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="4" fill="#1A1F71"/><path d="M16.5 16.5H14L15.8 7.5H18.3L16.5 16.5Z" fill="#F7F7F7"/><path d="M23.8 7.7C23.3 7.5 22.5 7.3 21.5 7.3C19.2 7.3 17.5 8.5 17.5 10.2C17.5 11.4 18.5 12.1 19.3 12.5C20.1 12.9 20.4 13.2 20.4 13.6C20.4 14.2 19.7 14.5 19 14.5C18 14.5 17.5 14.3 16.7 14L16.4 13.9L16.1 15.9C16.7 16.2 17.8 16.4 19 16.4C21.4 16.4 23.1 15.2 23.1 13.4C23.1 12.4 22.5 11.7 21.2 11.1C20.5 10.7 20.1 10.5 20.1 10.1C20.1 9.7 20.5 9.3 21.4 9.3C22.1 9.3 22.7 9.5 23.1 9.7L23.3 9.8L23.8 7.7Z" fill="#F7F7F7"/><path d="M27.1 7.5H25.3C24.8 7.5 24.4 7.7 24.2 8.2L21 16.5H23.4L23.9 15H26.8L27.1 16.5H29.3L27.1 7.5ZM24.5 13.2C24.7 12.7 25.5 10.5 25.5 10.5C25.5 10.5 25.7 9.9 25.8 9.5L26 10.4C26 10.4 26.6 13 26.7 13.2H24.5Z" fill="#F7F7F7"/><path d="M13.5 7.5L11.2 13.6L10.9 12.2C10.4 10.6 8.9 9 7.2 8.1L9.3 16.5H11.7L15.9 7.5H13.5Z" fill="#F7F7F7"/><path d="M8.6 7.5H4.9L4.8 7.7C7.7 8.4 9.7 10.2 10.4 12.2L9.6 8.2C9.5 7.7 9.1 7.5 8.6 7.5Z" fill="#FAA61A"/></svg></div>
          <div class="payment-icon-badge" title="Mastercard"><svg width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="4" fill="#252525"/><circle cx="14" cy="12" r="7" fill="#EB001B"/><circle cx="24" cy="12" r="7" fill="#F79E1B"/><path d="M19 6.8C20.5 7.9 21.5 9.8 21.5 12C21.5 14.2 20.5 16.1 19 17.2C17.5 16.1 16.5 14.2 16.5 12C16.5 9.8 17.5 7.9 19 6.8Z" fill="#FF5F00"/></svg></div>
          <div class="payment-icon-badge" title="PayPal"><svg width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="4" fill="#F7F9FC"/><path d="M14.5 7H18.8C20.6 7 21.8 8.1 21.5 9.9C21.1 12.1 19.5 13.2 17.7 13.2H16.5L15.8 17H13L14.5 7Z" fill="#003087"/><path d="M16.8 8.8H20.1C21.2 8.8 21.8 9.4 21.6 10.5C21.3 12 20.1 12.8 18.8 12.8H17.8L17.2 16H15.1L16.8 8.8Z" fill="#009CDE"/><path d="M22.5 9H26.8C28.6 9 29.8 10.1 29.5 11.9C29.1 14.1 27.5 15.2 25.7 15.2H24.5L23.8 19H21L22.5 9Z" fill="#009CDE"/></svg></div>
          <div class="payment-icon-badge" title="MoMo" style="background:#A50064;"><span style="color:#fff;font-size:.72rem;font-weight:800;letter-spacing:-.5px;line-height:1">MoMo</span></div>
          <div class="payment-icon-badge" title="ZaloPay" style="background:#0068FF;"><span style="color:#fff;font-size:.6rem;font-weight:800;letter-spacing:-.3px;line-height:1">Zalo<br>Pay</span></div>
          <div class="payment-icon-badge" title="Thanh toán khi nhận hàng" style="background:#28a745;"><span style="color:#fff;font-size:.65rem;font-weight:800;letter-spacing:-.3px;line-height:1">COD</span></div>
        </div>
      </div>
    </div>
  </footer>`;

  const CHAT_HTML = `
  <div id="liveChatPanel" style="display:none;position:fixed;bottom:88px;right:24px;width:320px;max-width:calc(100vw - 32px);background:#fff;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.2);z-index:100050;overflow:hidden">
    <div style="background:linear-gradient(135deg,#0d6efd,#7c3aed);color:#fff;padding:14px 16px;display:flex;justify-content:space-between;align-items:center">
      <div class="d-flex align-items-center gap-2">
        <div style="width:36px;height:36px;border-radius:50%;background:#fff;color:#0d6efd;display:flex;align-items:center;justify-content:center;font-weight:700">S</div>
        <div><div class="fw-semibold small">Hỗ trợ ShopVN</div><div style="font-size:.7rem;opacity:.8"><span class="text-success">●</span> Đang trực tuyến</div></div>
      </div>
      <button onclick="toggleLiveChat()" style="background:none;border:none;color:#fff;cursor:pointer"><i class="bi bi-x-lg"></i></button>
    </div>
    <div class="chat-messages" id="chatMessages" style="padding:14px;height:240px;overflow-y:auto;background:#f8f9fa">
      <div class="chat-bubble agent" style="background:#e9ecef;padding:8px 12px;border-radius:12px;margin-bottom:6px;font-size:.85rem;max-width:80%">Xin chào! Tôi là trợ lý ShopVN. Tôi có thể giúp gì cho bạn hôm nay? 😊</div>
      <div class="chat-bubble agent" style="background:#e9ecef;padding:8px 12px;border-radius:12px;margin-bottom:6px;font-size:.85rem;max-width:80%">Bạn có thể hỏi về đơn hàng, sản phẩm, hoặc chính sách của chúng tôi.</div>
    </div>
    <div class="chat-input-area" style="padding:10px;border-top:1px solid #e9ecef;display:flex;gap:6px">
      <input type="text" class="form-control form-control-sm" id="chatInput" placeholder="Nhập tin nhắn..." />
      <button class="btn btn-primary btn-sm px-3" onclick="sendChatMsg()"><i class="bi bi-send"></i></button>
    </div>
  </div>
  <button id="liveChatBtn" onclick="toggleLiveChat()" aria-label="Live Chat"
    style="position:fixed;bottom:24px;right:24px;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#0d6efd,#7c3aed);color:#fff;border:none;box-shadow:0 4px 16px rgba(13,110,253,.4);display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;z-index:100050">
    <i class="bi bi-chat-dots-fill"></i>
  </button>`;

  function inject() {
    const footerSlot = document.getElementById('shopvn-footer');
    if (footerSlot) footerSlot.outerHTML = FOOTER_HTML;
    else {
      const f = document.querySelector('footer');
      if (f) f.outerHTML = FOOTER_HTML;
    }
    const chatSlot = document.getElementById('shopvn-chat');
    if (chatSlot) chatSlot.outerHTML = CHAT_HTML;
    else if (!document.getElementById('liveChatBtn')) document.body.insertAdjacentHTML('beforeend', CHAT_HTML);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  // Ensure required globals exist
  window.toggleLiveChat = window.toggleLiveChat || function () {
    const panel = document.getElementById('liveChatPanel');
    if (!panel) return;
    const isOpen = panel.style.display === 'block';
    panel.style.display = isOpen ? 'none' : 'block';
  };
  window.sendChatMsg = window.sendChatMsg || function () {
    const input = document.getElementById('chatInput');
    const msgs = document.getElementById('chatMessages');
    const text = input.value.trim();
    if (!text) return;
    msgs.insertAdjacentHTML('beforeend', '<div class="chat-bubble user" style="background:#0d6efd;color:#fff;padding:8px 12px;border-radius:12px;margin-bottom:6px;font-size:.85rem;max-width:80%;margin-left:auto">' + text + '</div>');
    input.value = '';
    setTimeout(() => {
      msgs.insertAdjacentHTML('beforeend', '<div class="chat-bubble agent" style="background:#e9ecef;padding:8px 12px;border-radius:12px;margin-bottom:6px;font-size:.85rem;max-width:80%">Cảm ơn bạn đã liên hệ! Đội ngũ sẽ phản hồi sớm nhất.</div>');
      msgs.scrollTop = msgs.scrollHeight;
    }, 600);
    msgs.scrollTop = msgs.scrollHeight;
  };
})();
