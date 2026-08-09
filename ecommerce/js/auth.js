/** Firebase Authentication + Firestore user profiles. */
const Auth = (() => {
  const SESSION_KEY = 'shopvn_session';
  let cachedUser = readSession();

  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
  }

  function avatar(name) {
    const initials = String(name || 'SV').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0d6efd&color=fff&size=128&bold=true`;
  }

  function normalize(firebaseUser, profile = {}) {
    return {
      id: firebaseUser.uid,
      fullName: profile.fullName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Khách hàng',
      email: firebaseUser.email || profile.email || '',
      phone: profile.phone || firebaseUser.phoneNumber || '',
      avatar: profile.avatar || firebaseUser.photoURL || avatar(profile.fullName || firebaseUser.displayName),
      createdAt: profile.createdAt || firebaseUser.metadata?.creationTime || new Date().toISOString(),
      addresses: profile.addresses || [],
      role: profile.role || 'customer',
    };
  }

  function cache(user) {
    cachedUser = user;
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
    renderNavAuth();
    return user;
  }

  function errorMessage(err) {
    const messages = {
      'auth/email-already-in-use': 'Email này đã được đăng ký.',
      'auth/invalid-email': 'Email không hợp lệ.',
      'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
      'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa.',
      'auth/weak-password': 'Mật khẩu chưa đủ mạnh.',
      'auth/too-many-requests': 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.',
      'auth/network-request-failed': 'Không thể kết nối Firebase. Vui lòng kiểm tra mạng.',
      'auth/requires-recent-login': 'Vui lòng đăng nhập lại trước khi đổi mật khẩu.',
      'auth/wrong-password': 'Mật khẩu hiện tại không đúng.',
    };
    return messages[err?.code] || err?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }

  async function register({ fullName, email, phone = '', password }) {
    if (!fullName || !email || !password) return { ok: false, error: 'Vui lòng điền đầy đủ thông tin.' };
    if (password.length < 6) return { ok: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
    try {
      await FirebaseService.ready;
      const { auth, modules: f } = FirebaseService.authApi();
      const cred = await f.createUserWithEmailAndPassword(auth, email.trim(), password);
      await f.updateProfile(cred.user, { displayName: fullName.trim(), photoURL: avatar(fullName) });
      const profile = { fullName: fullName.trim(), email: cred.user.email, phone: phone.trim(), avatar: avatar(fullName), addresses: [], createdAt: new Date().toISOString() };
      await FirebaseService.saveUserProfile(cred.user.uid, profile);
      return { ok: true, user: cache(normalize(cred.user, profile)) };
    } catch (err) { return { ok: false, error: errorMessage(err) }; }
  }

  async function login({ email, password }) {
    try {
      await FirebaseService.ready;
      const { auth, modules: f } = FirebaseService.authApi();
      const cred = await f.signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await FirebaseService.getUserProfile(cred.user.uid) || {};
      return { ok: true, user: cache(normalize(cred.user, profile)) };
    } catch (err) { return { ok: false, error: errorMessage(err) }; }
  }

  async function logout() {
    await FirebaseService.ready;
    const { auth, modules: f } = FirebaseService.authApi();
    await f.signOut(auth);
    cache(null);
    if (['profile.html', 'orders.html', 'admin.html'].includes(location.pathname.split('/').pop())) location.href = 'auth.html';
  }

  async function ready() {
    try {
      const fbUser = await FirebaseService.waitForAuth();
      if (!fbUser) return cache(null);
      const profile = await FirebaseService.getUserProfile(fbUser.uid) || {};
      return cache(normalize(fbUser, profile));
    } catch (err) {
      console.error('Firebase initialization failed:', err);
      return cachedUser;
    }
  }

  function current() { return cachedUser; }
  function isLoggedIn() { return !!cachedUser; }
  function isAdmin() { return cachedUser?.role === 'admin'; }

  async function updateProfile({ fullName, phone, avatar: image }) {
    try {
      const fbUser = await FirebaseService.waitForAuth();
      if (!fbUser) throw Object.assign(new Error('Chưa đăng nhập.'), { code: 'auth/required' });
      const { modules: f } = FirebaseService.authApi();
      const data = { fullName: (fullName || cachedUser.fullName).trim(), phone: phone ?? cachedUser.phone, avatar: image || cachedUser.avatar };
      await f.updateProfile(fbUser, { displayName: data.fullName, photoURL: data.avatar });
      await FirebaseService.saveUserProfile(fbUser.uid, data);
      cache({ ...cachedUser, ...data });
      return { ok: true };
    } catch (err) { return { ok: false, error: errorMessage(err) }; }
  }

  async function changePassword({ currentPassword, newPassword }) {
    try {
      const user = await FirebaseService.waitForAuth();
      if (!user?.email) throw new Error('Chưa đăng nhập.');
      const { modules: f } = FirebaseService.authApi();
      await f.reauthenticateWithCredential(user, f.EmailAuthProvider.credential(user.email, currentPassword));
      await f.updatePassword(user, newPassword);
      return { ok: true };
    } catch (err) { return { ok: false, error: errorMessage(err) }; }
  }

  async function sendPasswordReset(email) {
    try {
      await FirebaseService.ready;
      const { auth, modules: f } = FirebaseService.authApi();
      await f.sendPasswordResetEmail(auth, email.trim());
      return { ok: true };
    } catch (err) { return { ok: false, error: errorMessage(err) }; }
  }

  async function addAddress(addr) {
    const addresses = [{ ...addr, id: 'addr_' + Date.now() }, ...(cachedUser?.addresses || [])];
    await FirebaseService.saveUserProfile(cachedUser.id, { addresses });
    cache({ ...cachedUser, addresses });
  }

  async function removeAddress(id) {
    const addresses = (cachedUser?.addresses || []).filter(a => a.id !== id);
    await FirebaseService.saveUserProfile(cachedUser.id, { addresses });
    cache({ ...cachedUser, addresses });
  }

  function getAddresses() { return cachedUser?.addresses || []; }
  async function requireAuth() {
    const user = await ready();
    if (!user) { location.href = `auth.html?redirect=${encodeURIComponent(location.pathname.split('/').pop())}`; return false; }
    return true;
  }

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function renderNavAuth() {
    const el = document.getElementById('navAuthArea'); if (!el) return;
    const user = cachedUser;
    el.innerHTML = user ? `<div class="dropdown"><button class="btn btn-outline-light d-flex align-items-center gap-2 py-1 px-2" data-bs-toggle="dropdown"><img src="${esc(user.avatar)}" alt="" width="30" height="30" class="rounded-circle" style="object-fit:cover"><span class="d-none d-md-inline text-truncate fw-semibold" style="max-width:110px">${esc(user.fullName)}</span></button><ul class="dropdown-menu dropdown-menu-end shadow border-0"><li><a class="dropdown-item" href="profile.html">Tài khoản của tôi</a></li><li><a class="dropdown-item" href="orders.html">Đơn hàng của tôi</a></li><li><a class="dropdown-item" href="wishlist.html">Danh sách yêu thích</a></li><li><hr class="dropdown-divider"></li><li><button class="dropdown-item text-danger" onclick="Auth.logout()">Đăng xuất</button></li></ul></div>` : `<a href="auth.html" class="btn btn-outline-light"><i class="bi bi-person-circle me-1"></i><span class="d-none d-md-inline">Đăng nhập</span></a>`;
  }

  document.addEventListener('DOMContentLoaded', () => { renderNavAuth(); ready(); });
  return { register, login, logout, ready, current, isLoggedIn, isAdmin, updateProfile, changePassword, sendPasswordReset, addAddress, removeAddress, getAddresses, renderNavAuth, requireAuth };
})();
