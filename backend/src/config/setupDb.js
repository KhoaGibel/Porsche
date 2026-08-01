import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('🔄 Đang kết nối tới Database...');
  
  try {
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      },
      multipleStatements: true // Cho phép chạy nhiều lệnh SQL cùng lúc
    });

    console.log('✅ Đã kết nối thành công!');
    
    // Tự động tạo database nếu chưa có (rất hữu ích cho localhost hoặc root user)
    const dbName = process.env.MYSQL_DATABASE || 'porsche_payments';
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await conn.query(`USE \`${dbName}\``);
    
    console.log(`✅ Đang sử dụng database: ${dbName}`);
    console.log('🔄 Đang tạo các bảng (tables)...');

    const schemaPath = path.join(__dirname, '../../sql/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Chạy toàn bộ file schema.sql
    await conn.query(sql);

    console.log('✅ Khởi tạo Database thành công! Các bảng đã được tạo.');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khởi tạo Database:', err.message);
    process.exit(1);
  }
}

setupDatabase();
