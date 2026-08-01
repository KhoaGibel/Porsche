import pool from '../src/config/mysql.js';

async function checkMySQL() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Tables in porsche_payments:');
    console.log(rows);
    process.exit(0);
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    process.exit(1);
  }
}

checkMySQL();
