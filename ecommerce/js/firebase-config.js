/**
 * Firebase bootstrap + data access layer for the no-build ShopVN frontend.
 * The public web config identifies the Firebase project; access is enforced by
 * Firebase Authentication and Firestore Security Rules, not by hiding this file.
 */
const FirebaseService = (() => {
  const firebaseConfig = {
    apiKey: 'AIzaSyDGaH6l8utmkdl4pgXWS-Ln_kQpDHFzY08',
    authDomain: 'shopvn-63536.firebaseapp.com',
    databaseURL: 'https://shopvn-63536-default-rtdb.firebaseio.com',
    projectId: 'shopvn-63536',
    storageBucket: 'shopvn-63536.firebasestorage.app',
    messagingSenderId: '300379997634',
    appId: '1:300379997634:web:6ced8f8cd331e3a446825b',
    measurementId: 'G-Z4B15L2TL4',
  };

  const SDK_VERSION = '12.16.0';
  let modules;
  let app;
  let auth;
  let db;

  const ready = Promise.all([
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`),
  ]).then(([appModule, authModule, firestoreModule]) => {
    modules = { ...appModule, ...authModule, ...firestoreModule };
    app = modules.getApps().length ? modules.getApp() : modules.initializeApp(firebaseConfig);
    auth = modules.getAuth(app);
    db = modules.getFirestore(app);
    return { app, auth, db };
  });

  async function waitForAuth() {
    await ready;
    if (typeof auth.authStateReady === 'function') {
      await auth.authStateReady();
    } else {
      await new Promise((resolve, reject) => {
        const unsubscribe = modules.onAuthStateChanged(
          auth,
          () => { unsubscribe(); resolve(); },
          error => { unsubscribe(); reject(error); }
        );
      });
    }
    return auth.currentUser;
  }

  async function requireUser() {
    const user = await waitForAuth();
    if (!user) throw Object.assign(new Error('Bạn chưa đăng nhập.'), { code: 'auth/required' });
    return user;
  }

  async function getUserProfile(uid) {
    await ready;
    const snap = await modules.getDoc(modules.doc(db, 'users', uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  async function saveUserProfile(uid, data) {
    await ready;
    await modules.setDoc(modules.doc(db, 'users', uid), {
      ...data,
      updatedAt: modules.serverTimestamp(),
    }, { merge: true });
  }

  async function createOrder(data) {
    const user = await requireUser();
    const ref = modules.doc(modules.collection(db, 'orders'));
    const code = `SVN${ref.id.slice(0, 8).toUpperCase()}`;
    await modules.setDoc(ref, {
      ...data,
      id: ref.id,
      code,
      userId: user.uid,
      userEmail: user.email || '',
      status: 'pending',
      createdAt: modules.serverTimestamp(),
      updatedAt: modules.serverTimestamp(),
    });
    return { id: ref.id, code };
  }

  async function getMyOrders() {
    const user = await requireUser();
    const q = modules.query(
      modules.collection(db, 'orders'),
      modules.where('userId', '==', user.uid)
    );
    const snap = await modules.getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }

  async function updateMyOrder(orderId, data) {
    const user = await requireUser();
    const ref = modules.doc(db, 'orders', orderId);
    const snap = await modules.getDoc(ref);
    if (!snap.exists() || snap.data().userId !== user.uid) throw new Error('Không tìm thấy đơn hàng.');
    await modules.updateDoc(ref, { ...data, updatedAt: modules.serverTimestamp() });
  }

  async function getProducts() {
    await ready;
    const snap = await modules.getDocs(modules.collection(db, 'products'));
    return snap.docs.map(d => ({ ...d.data(), id: Number(d.data().id ?? d.id) }));
  }

  async function getProduct(productId) {
    await ready;
    const snap = await modules.getDoc(modules.doc(db, 'products', String(productId)));
    return snap.exists() ? { ...snap.data(), id: Number(snap.data().id ?? snap.id) } : null;
  }

  async function saveProducts(products) {
    const user = await requireUser();
    const profile = await getUserProfile(user.uid);
    if (profile?.role !== 'admin') throw new Error('Tài khoản chưa có quyền quản trị sản phẩm.');

    const chunks = [];
    for (let i = 0; i < products.length; i += 450) chunks.push(products.slice(i, i + 450));
    for (const chunk of chunks) {
      const batch = modules.writeBatch(db);
      chunk.forEach(product => {
        const normalized = {
          id: Number(product.id),
          title: String(product.title || ''),
          price: Number(product.price || 0),
          description: String(product.description || ''),
          category: String(product.category || ''),
          image: String(product.image || ''),
          rating: {
            rate: Number(product.rating?.rate || 0),
            count: Number(product.rating?.count || 0),
          },
          stock: Number(product.stock ?? 50),
          sales: Number(product.sales ?? 0),
          active: product.active !== false,
          updatedAt: modules.serverTimestamp(),
        };
        batch.set(modules.doc(db, 'products', String(normalized.id)), normalized, { merge: true });
      });
      await batch.commit();
    }
    return products.length;
  }

  async function deleteProduct(productId) {
    const user = await requireUser();
    const profile = await getUserProfile(user.uid);
    if (profile?.role !== 'admin') throw new Error('Tài khoản chưa có quyền xóa sản phẩm.');
    await modules.deleteDoc(modules.doc(db, 'products', String(productId)));
  }

  async function getAdminData(documentId = 'dashboard') {
    const user = await requireUser();
    const profile = await getUserProfile(user.uid);
    if (profile?.role !== 'admin') throw new Error('Bạn không có quyền đọc dữ liệu quản trị.');
    const snap = await modules.getDoc(modules.doc(db, 'adminData', documentId));
    return snap.exists() ? snap.data() : null;
  }

  async function saveAdminData(data, documentId = 'dashboard') {
    const user = await requireUser();
    const profile = await getUserProfile(user.uid);
    if (profile?.role !== 'admin') throw new Error('Bạn không có quyền ghi dữ liệu quản trị.');
    await modules.setDoc(modules.doc(db, 'adminData', documentId), {
      ...data,
      updatedAt: modules.serverTimestamp(),
    }, { merge: true });
  }

  function authApi() {
    if (!modules || !auth) throw new Error('Firebase chưa sẵn sàng.');
    return { auth, modules };
  }

  return {
    ready, waitForAuth, authApi, getUserProfile, saveUserProfile,
    createOrder, getMyOrders, updateMyOrder, getProducts, getProduct, saveProducts, deleteProduct,
    getAdminData, saveAdminData,
  };
})();
