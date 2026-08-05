import pool from './src/config/mysql.js';
async function fix() {
  try {
    console.log('Dropping payments table...');
    await pool.query('DROP TABLE IF EXISTS payments');
    console.log('Recreating payments table...');
    await pool.query(`
      CREATE TABLE payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        method VARCHAR(50) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'initiated',
        card_last4 VARCHAR(4),
        card_brand VARCHAR(50),
        gateway_txn_id VARCHAR(255),
        gateway_response JSON,
        cash_confirmed_by VARCHAR(255),
        cash_confirmed_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log('Done.');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
fix();
