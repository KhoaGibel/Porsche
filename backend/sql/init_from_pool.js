import pool from '../src/config/mysql.js';

async function init() {
  try {
    console.log('Creating tables using backend pool...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        mongo_user_id VARCHAR(50),
        
        full_name VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        id_card VARCHAR(20),
        date_of_birth DATE,
        address VARCHAR(255),
        
        plan_id VARCHAR(50),
        plan_name VARCHAR(100),
        base_price DECIMAL(15,2),
        
        insurance_id VARCHAR(50),
        insurance_name VARCHAR(100),
        insurance_price DECIMAL(15,2),
        
        total_amount DECIMAL(15,2),
        
        drive_date DATE,
        drive_time VARCHAR(20),
        showroom VARCHAR(100),
        note TEXT,
        
        status VARCHAR(50) DEFAULT 'pending_payment',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "orders" ensured.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        trans_id VARCHAR(100),
        amount DECIMAL(15,2),
        method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table "payments" ensured.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        changed_by VARCHAR(100),
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table "order_logs" ensured.');
    
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  } finally {
    process.exit(0);
  }
}

init();
