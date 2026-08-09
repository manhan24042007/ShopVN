# Firebase setup for ShopVN

The web app is configured for Firebase project `shopvn-63536`.

## Console setup

1. Open Firebase Console > Authentication > Sign-in method.
2. Enable **Email/Password**.
3. Open Firestore Database and create the database (Native mode).
4. Publish the rules from `firestore.rules`.
5. In Authentication > Settings > Authorized domains, add the production domain.

## Deploy Firestore rules with the CLI

```sh
firebase login
firebase use shopvn-63536
firebase deploy --only firestore:rules
```

Collections used by the app:

- `users/{uid}`: profile and saved addresses; only that authenticated user can read/update it.
- `orders/{orderId}`: checkout orders; customers can read their own orders and only cancel them.
- `products/{productId}`: public catalog; only a user with `role: "admin"` can write.

## Seed products

1. Register/sign in to the account that will manage products.
2. In Firestore Console, open `users/{uid}` and add the field `role` with value `admin`.
3. Publish `firestore.rules`.
4. Serve the site over HTTP and open `ecommerce/firebase-seed.html`.
5. Click **Nạp/cập nhật sản phẩm**. The current 20 FakeStore products are upserted into Firestore.

The storefront reads Firestore first and falls back to FakeStore API only while
the `products` collection is empty or unavailable.

The Firebase web API key in `ecommerce/js/firebase-config.js` is a public project
identifier. Security is enforced by Authentication, Firestore Rules, authorized
domains, and API-key restrictions in Google Cloud Console.
