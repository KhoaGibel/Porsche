// Kiểm tra admin login và gọi API /admin/users
import http from 'http';

function httpPost(path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function httpGet(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function test() {
  console.log('1️⃣  Đăng nhập admin...');
  const loginRes = await httpPost('/api/auth/admin-login', {
    email: 'admin@porsche.vn',
    password: 'Admin@Porsche2024',
  });

  if (loginRes.status !== 200) {
    console.error('❌ Đăng nhập thất bại:', loginRes.data.message);
    return;
  }

  const token = loginRes.data.token;
  console.log('✅ Đăng nhập thành công! Token:', token.substring(0, 40) + '...');
  console.log('   Role:', loginRes.data.user.role, '| Email:', loginRes.data.user.email);

  console.log('\n2️⃣  Gọi /admin/users...');
  const usersRes = await httpGet('/api/admin/users', token);

  if (usersRes.status === 200) {
    const users = usersRes.data;
    console.log(`✅ Lấy danh sách users thành công! Tổng: ${users.length} tài khoản`);
    users.slice(0, 5).forEach((u, i) => {
      console.log(`   ${i+1}. ${u.fullName} — ${u.email} [${u.role}]`);
    });
    if (users.length > 5) console.log(`   ... và ${users.length - 5} tài khoản khác`);
  } else {
    console.error('❌ Lỗi lấy users:', usersRes.data.message);
  }
}

test().catch(console.error);
