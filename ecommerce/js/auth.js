/**
 * auth.js — Hệ thống xác thực người dùng (localStorage)
 */

const Auth = (() => {
  const USERS_KEY   = 'shopvn_users';
  const SESSION_KEY = 'shopvn_session';

  /* ── Helpers ──────────────────────────────────────────── */

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function hashPwd(p) {
    let h = 0;
    for (let i = 0; i < p.length; i++) { h = Math.imul(31, h) + p.charCodeAt(i) | 0; }
    return h.toString(36);
  }

  function uid() { return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function avatar(name) {
    const init = name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(init)}&background=0d6efd&color=fff&size=128&bold=true`;
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Core ─────────────────────────────────────────────── */

  function register({ fullName, email, phone = '', password }) {
    if (!fullName || !email || !password) return { ok: false, error: 'Vui lòng điền đầy đủ thông tin.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Email không hợp lệ.' };
    if (password.length < 6) return { ok: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };

    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return { ok: false, error: 'Email này đã được đăng ký.' };

    const user = {
      id: uid(), fullName: fullName.trim(),
      email: email.toLowerCase().trim(), phone,
      password: hashPwd(password),
      avatar: avatar(fullName),
      createdAt: new Date().toISOString(),
      addresses: [],
    };
    users.push(user);
    saveUsers(users);
    createSession(user);
    return { ok: true, user: current() };
  }

  function login({ email, password }) {
    if (!email || !password) return { ok: false, error: 'Vui lòng nhập email và mật khẩu.' };
    const user = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user || user.password !== hashPwd(password))
      return { ok: false, error: 'Email hoặc mật khẩu không đúng.' };
    createSession(user);
    return { ok: true, user: current() };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    renderNavAuth();
    const page = location.pathname.split('/').pop();
    if (['profile.html', 'orders.html'].includes(page))
      location.href = 'auth.html?redirect=' + page;
  }

  function createSession(user) {
    const sess = { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, avatar: user.avatar, createdAt: user.createdAt };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
    renderNavAuth();
    return sess;
  }

  function current() {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  }

  function isLoggedIn() { return current() !== null; }

  function updateProfile({ fullName, phone, avatar: av }) {
    const user = current();
    if (!user) return { ok: false, error: 'Chưa đăng nhập.' };
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return { ok: false, error: 'Tài khoản không tồn tại.' };
    if (fullName) users[idx].fullName = fullName.trim();
    if (phone !== undefined) users[idx].phone = phone.trim();
    if (av) users[idx].avatar = av;
    saveUsers(users);
    createSession(users[idx]);
    return { ok: true };
  }

  function changePassword({ currentPassword, newPassword }) {
    const user = current();
    if (!user) return { ok: false, error: 'Chưa đăng nhập.' };
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (users[idx].password !== hashPwd(currentPassword))
      return { ok: false, error: 'Mật khẩu hiện tại không đúng.' };
    if (newPassword.length < 6) return { ok: false, error: 'Mật khẩu mới phải ≥ 6 ký tự.' };
    users[idx].password = hashPwd(newPassword);
    saveUsers(users);
    return { ok: true };
  }

  function addAddress(addr) {
    const user = current();
    if (!user) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;
    addr.id = 'addr_' + Date.now();
    users[idx].addresses = users[idx].addresses || [];
    users[idx].addresses.unshift(addr);
    saveUsers(users);
  }

  function removeAddress(addrId) {
    const user = current();
    if (!user) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;
    users[idx].addresses = (users[idx].addresses || []).filter(a => a.id !== addrId);
    saveUsers(users);
  }

  function getAddresses() {
    const user = current();
    if (!user) return [];
    const found = getUsers().find(u => u.id === user.id);
    return found ? (found.addresses || []) : [];
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      location.href = 'auth.html?redirect=' + location.pathname.split('/').pop();
      return false;
    }
    return true;
  }

  /* ── Navbar Auth UI ──────────────────────────────────── */

  function renderNavAuth() {
    const el = document.getElementById('navAuthArea');
    if (!el) return;
    const user = current();
    if (user) {
      el.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-outline-light d-flex align-items-center gap-2 py-1 px-2"
                  data-bs-toggle="dropdown" aria-expanded="false" aria-label="Tài khoản">
            <img referrerpolicy="no-referrer" src="${esc(user.avatar)}" alt="" width="30" height="30"
                 class="rounded-circle" style="object-fit:cover;border:2px solid rgba(255,255,255,.4)"/>
            <span class="d-none d-md-inline text-truncate fw-semibold" style="max-width:110px">${esc(user.fullName)}</span>
            <i class="bi bi-chevron-down small opacity-75"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow border-0" style="min-width:210px">
            <li>
              <div class="px-3 py-2 border-bottom">
                <div class="fw-semibold small">${esc(user.fullName)}</div>
                <div class="text-muted" style="font-size:.78rem">${esc(user.email)}</div>
              </div>
            </li>
            <li><a class="dropdown-item py-2" href="profile.html"><i class="bi bi-person-circle me-2 text-primary"></i>Tài khoản của tôi</a></li>
            <li><a class="dropdown-item py-2" href="orders.html"><i class="bi bi-bag-check me-2 text-success"></i>Đơn hàng của tôi</a></li>
            <li><a class="dropdown-item py-2" href="wishlist.html"><i class="bi bi-heart me-2 text-danger"></i>Danh sách yêu thích</a></li>
            <li><hr class="dropdown-divider my-1"></li>
            <li><button class="dropdown-item py-2 text-danger" onclick="Auth.logout()"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</button></li>
          </ul>
        </div>`;
    } else {
      el.innerHTML = `
        <a href="auth.html" class="btn btn-outline-light d-flex align-items-center gap-2">
          <i class="bi bi-person-circle fs-5"></i>
          <span class="d-none d-md-inline">Đăng nhập</span>
        </a>`;
    }
  }

  document.addEventListener('DOMContentLoaded', renderNavAuth);

  return { register, login, logout, current, isLoggedIn, updateProfile, changePassword,
           addAddress, removeAddress, getAddresses, renderNavAuth, requireAuth };
})();

