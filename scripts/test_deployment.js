/**
 * Comprehensive API & Route Verification Test Suite
 * Tests all endpoints: Auth, Products, Cart, Orders, Admin, and Static Serving.
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { ...headers };
    let postData = null;

    if (body) {
      postData = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (_) {}
          resolve({ status: res.statusCode, headers: res.headers, body: json || data });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Comprehensive Deployment Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.success === true, 'GET /api/health returned 200 OK');

    // 2. Products list
    const prods = await request('GET', '/api/products?limit=10');
    assert(prods.status === 200 && prods.body.products && prods.body.products.length > 0, `GET /api/products loaded ${prods.body?.products?.length} products`);

    // 3. Categories
    const cats = await request('GET', '/api/products/categories');
    assert(cats.status === 200 && cats.body.categories && cats.body.categories.length > 0, `GET /api/products/categories loaded ${cats.body?.categories?.length} categories`);

    // 4. Registration
    const testEmail = `testuser_${Date.now()}@example.com`;
    const reg = await request('POST', '/api/auth/register', {
      name: 'Nithya Sri',
      email: testEmail,
      password: 'Password@123',
      phone: '9876543210'
    });
    assert(reg.status === 201 && reg.body.token, 'POST /api/auth/register creates user and returns JWT token');
    const customerToken = reg.body.token;

    // 5. Customer Login
    const login = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'Password@123'
    });
    assert(login.status === 200 && login.body.token, 'POST /api/auth/login authenticates customer successfully');

    // 6. Admin Login
    const adminLogin = await request('POST', '/api/auth/admin-login', {
      email: 'vimala@sssai.in',
      password: 'Admin@123'
    });
    assert(adminLogin.status === 200 && adminLogin.body.token && adminLogin.body.user.role === 'admin', 'POST /api/auth/admin-login authenticates admin Vimala successfully');
    const adminToken = adminLogin.body.token;

    // 7. Cart Operations
    const inStockProd = prods.body.products.find(p => p.stock >= 2) || prods.body.products[0];
    const addToCart = await request('POST', '/api/cart', { product_id: inStockProd.id, quantity: 1 }, { Authorization: `Bearer ${customerToken}` });
    assert(addToCart.status === 201 && addToCart.body.success, `POST /api/cart adds in-stock item (Product #${inStockProd.id}) to cart`);

    const getCart = await request('GET', '/api/cart', null, { Authorization: `Bearer ${customerToken}` });
    assert(getCart.status === 200 && getCart.body.items && getCart.body.items.length > 0, `GET /api/cart returns ${getCart.body?.items?.length} cart items with calculated total`);

    // 8. Order Creation (Checkout)
    const orderRes = await request('POST', '/api/orders', {
      shipping_name: 'Nithya Sri',
      shipping_phone: '9876543210',
      shipping_address: '12 Temple Street',
      shipping_city: 'Salem',
      shipping_state: 'Tamil Nadu',
      shipping_pincode: '636001',
      payment_method: 'COD',
      coupon_code: 'FIRST15'
    }, { Authorization: `Bearer ${customerToken}` });
    assert(orderRes.status === 201 && orderRes.body.order_id, `POST /api/orders successfully created order #${orderRes.body?.order_id} with coupon FIRST15`);
    const orderId = orderRes.body.order_id;

    // 9. Admin update order status
    const updateStatus = await request('PUT', `/api/orders/${orderId}/status`, { status: 'Shipped' }, { Authorization: `Bearer ${adminToken}` });
    assert(updateStatus.status === 200 && updateStatus.body.success, `PUT /api/orders/${orderId}/status successfully updated status to Shipped`);

    // 10. Admin view orders
    const adminOrders = await request('GET', '/api/orders', null, { Authorization: `Bearer ${adminToken}` });
    assert(adminOrders.status === 200 && adminOrders.body.orders && adminOrders.body.orders.length > 0, 'GET /api/orders loads admin order management list');

    // 11. Static Page Routes verification
    const staticPages = ['/', '/shop', '/cart', '/checkout', '/login', '/register', '/orders', '/admin/', '/welcome.html'];
    for (const p of staticPages) {
      const pageRes = await request('GET', p);
      assert(pageRes.status === 200, `GET ${p} serves 200 OK`);
    }

    const adminRedirect = await request('GET', '/admin');
    assert(adminRedirect.status === 301 || adminRedirect.status === 200, 'GET /admin resolves with 301 redirect or 200 OK');

    console.log('\n------------------------------------------------------------');
    console.log(`Test Summary: ${passed} passed, ${failed} failed`);
    console.log('------------------------------------------------------------\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
