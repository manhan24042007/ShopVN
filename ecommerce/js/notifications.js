/**
 * notifications.js — Notification Center
 * Badge chuông trên navbar, danh sách thông báo dropdown
 */

const Notifications = (() => {
  const KEY = 'shopvn_notifications';

  const DEFAULT_NOTIFICATIONS = [
    { id: 1, type: 'promo',  icon: 'bi-gift-fill',        color: 'text-danger',  title: 'Ưu đãi hôm nay!',          body: 'Giảm 20% toàn bộ điện tử — chỉ hôm nay.',     time: '2 phút trước', read: false },
    { id: 2, type: 'order',  icon: 'bi-bag-check-fill',   color: 'text-success', title: 'Đơn hàng xác nhận',        body: 'Đơn #SVN12345678 đang được xử lý.',            time: '1 giờ trước',  read: false },
    { id: 3, type: 'system', icon: 'bi-bell-fill',        color: 'text-primary', title: 'Chào mừng đến ShopVN!',    body: 'Tạo tài khoản để nhận ưu đãi thành viên.',     time: '1 ngày trước', read: true  },
    { id: 4, type: 'promo',  icon: 'bi-truck',            color: 'text-info',    title: 'Miễn phí vận chuyển',      body: 'Đơn từ $50 được miễn phí vận chuyển toàn quốc.', time: '2 ngày trước', read: true  },
  ];

  function getAll() {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATIONS;
  }

  function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

  function unreadCount() { return getAll().filter(n => !n.read).length; }

  function markRead(id) {
    const items = getAll();
    const n = items.find(x => x.id === id);
    if (n) { n.read = true; save(items); updateBadge(); }
  }

  function markAllRead() {
    const items = getAll().map(n => ({ ...n, read: true }));
    save(items); updateBadge(); renderDropdown();
  }

  function addNotification({ type = 'system', icon = 'bi-bell-fill', color = 'text-primary', title, body }) {
    const items = getAll();
    items.unshift({ id: Date.now(), type, icon, color, title, body, time: 'Vừa xong', read: false });
    save(items.slice(0, 20)); // keep max 20
    updateBadge(); renderDropdown();
  }

  /* ── Badge update ──────────────────────────────────── */
  function updateBadge() {
    const badge = document.getElementById('notifBadge');
    const count = unreadCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  /* ── Render dropdown content ───────────────────────── */
  function renderDropdown() {
    const menu = document.getElementById('notifMenu');
    if (!menu) return;
    const items = getAll();
    const unread = items.filter(n => !n.read).length;

    menu.innerHTML = `
      <div class="px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
        <span class="fw-semibold">Thông báo ${unread > 0 ? `<span class="badge bg-danger ms-1">${unread}</span>` : ''}</span>
        ${unread > 0 ? `<button class="btn btn-link btn-sm p-0 text-primary text-decoration-none" style="font-size:.78rem" onclick="Notifications.markAllRead()">Đọc tất cả</button>` : ''}
      </div>
      ${items.length === 0
        ? `<div class="text-center py-4 text-muted small"><i class="bi bi-bell-slash fs-3 d-block mb-2 opacity-25"></i>Không có thông báo nào</div>`
        : items.slice(0, 6).map(n => `
        <div class="notif-item px-3 py-2 border-bottom d-flex gap-3 align-items-start cursor-pointer ${!n.read ? 'notif-unread' : ''}"
             onclick="Notifications.markRead(${n.id}); Notifications.renderDropdown()" role="button">
          <div class="flex-shrink-0 mt-1">
            <i class="bi ${n.icon} ${n.color} fs-5"></i>
          </div>
          <div class="flex-grow-1 min-w-0">
            <div class="fw-semibold" style="font-size:.85rem">${API.escapeHtml(n.title)}</div>
            <div class="text-muted" style="font-size:.78rem">${API.escapeHtml(n.body)}</div>
            <div class="text-muted" style="font-size:.72rem"><i class="bi bi-clock me-1"></i>${n.time}</div>
          </div>
          ${!n.read ? '<div class="flex-shrink-0 mt-2"><span class="rounded-circle bg-primary d-block" style="width:8px;height:8px"></span></div>' : ''}
        </div>`).join('')}
      <div class="px-3 py-2 text-center">
        <a href="#" class="btn btn-link btn-sm text-primary text-decoration-none" style="font-size:.82rem">
          Xem tất cả thông báo →
        </a>
      </div>`;
  }

  /* ── Inject bell into navbar ───────────────────────── */
  function inject() {
    const authArea = document.getElementById('navAuthArea');
    if (!authArea) return;

    // Insert bell button BEFORE navAuthArea
    if (document.getElementById('notifWrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'notifWrapper';
    wrapper.className = 'dropdown';
    wrapper.innerHTML = `
      <button class="btn btn-outline-light position-relative d-flex align-items-center justify-content-center"
              style="width:40px;height:38px"
              data-bs-toggle="dropdown" data-bs-auto-close="outside"
              aria-expanded="false" aria-label="Thông báo">
        <i class="bi bi-bell fs-5"></i>
        <span id="notifBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style="font-size:.65rem;min-width:18px;height:18px;display:none;align-items:center;justify-content:center;padding:0 4px">0</span>
      </button>
      <div id="notifMenu" class="dropdown-menu dropdown-menu-end p-0 border-0 shadow"
           style="min-width:320px;border-radius:14px;overflow:hidden;margin-top:8px!important"></div>`;

    authArea.parentNode.insertBefore(wrapper, authArea);
    renderDropdown();
    updateBadge();

    // Re-render on open
    wrapper.querySelector('button').addEventListener('show.bs.dropdown', () => {
      renderDropdown();
    });
  }

  document.addEventListener('DOMContentLoaded', inject);

  return { getAll, unreadCount, markRead, markAllRead, addNotification, updateBadge, renderDropdown };
})();
