import pool from '../src/config/mysql.js';

async function initDB() {
  try {
    await pool.query('CREATE DATABASE IF NOT EXISTS porsche_payments');
    console.log('Database ensured');
    await pool.query('USE porsche_payments');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        mongo_user_id VARCHAR(100),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        id_card VARCHAR(50) NOT NULL,
        date_of_birth DATE,
        address TEXT,
        plan_id VARCHAR(50) NOT NULL,
        plan_name VARCHAR(255) NOT NULL,
        base_price DECIMAL(15,2) NOT NULL DEFAULT 0,
        insurance_id VARCHAR(50),
        insurance_name VARCHAR(255),
        insurance_price DECIMAL(15,2) NOT NULL DEFAULT 0,
        total_amount DECIMAL(15,2) NOT NULL,
        drive_date DATE NOT NULL,
        drive_time VARCHAR(50) NOT NULL,
        showroom VARCHAR(255) NOT NULL,
        note TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending_payment',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
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
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by VARCHAR(255) NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    process.exit(0);
  }
}

initDB();
