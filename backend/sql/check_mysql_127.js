import mysql from 'mysql2/promise';

async function checkMySQL() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'porsche_payments'
    });
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Connected with empty password to 127.0.0.1! Tables:');
    console.log(rows);
    process.exit(0);
  } catch (err1) {
    console.log('Failed with empty password:', err1.message);
    try {
      const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '123456',
        database: 'porsche_payments'
      });
      const [rows] = await connection.query('SHOW TABLES');
      console.log('Connected with 123456 to 127.0.0.1! Tables:');
      console.log(rows);
      process.exit(0);
    } catch (err2) {
      console.log('Failed with 123456:', err2.message);
      process.exit(1);
    }
  }
}

checkMySQL();
