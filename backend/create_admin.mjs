// Script tạo tài khoản Admin thật trong MongoDB
import http from 'http';

const payload = JSON.stringify({
  setupSecret: 'porsche_setup_2024_secret',
  email: 'admin@porsche.vn',
  password: 'Admin@Porsche2024',
  fullName: 'Super Admin',
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/admin-setup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

console.log('🔧 Đang tạo tài khoản Admin...\n');

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ ' + (data.message || 'Tạo admin thành công!'));
        console.log('📧 Email    :', data.user?.email);
        console.log('👤 Tên      :', data.user?.fullName);
        console.log('🔐 Quyền    :', data.user?.role);
        console.log('🔑 Token    :', data.token ? data.token.substring(0, 50) + '...' : 'N/A');
        console.log('\n🎉 Bây giờ bạn có thể đăng nhập tại /login bằng:');
        console.log('   Email   : admin@porsche.vn');
        console.log('   Password: Admin@Porsche2024');
      } else {
        console.error('❌ Lỗi:', data.message);
      }
    } catch {
      console.error('❌ Không parse được response:', body);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Không thể kết nối tới backend:', err.message);
});

req.write(payload);
req.end();
