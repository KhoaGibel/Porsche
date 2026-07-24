import pool from '../config/mysql.js';
 
// ── Tạo mã đơn hàng ──
function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TDR-${y}-${rand}`;
}
 
export const OrderModel = {
 
  // ── Tạo order mới ──
  async create(data) {
    const orderNumber = generateOrderNumber();
 
    const [result] = await pool.query(
      `INSERT INTO orders (
        order_number, mongo_user_id,
        full_name, email, phone, id_card, date_of_birth, address,
        plan_id, plan_name, base_price,
        insurance_id, insurance_name, insurance_price,
        total_amount,
        drive_date, drive_time, showroom, note,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber, data.mongoUserId ?? null,
        data.fullName, data.email, data.phone, data.idCard, data.dob || null, data.address || null,
        data.planId, data.planName, data.basePrice,
        data.insuranceId ?? null, data.insuranceName ?? null, data.insurancePrice ?? 0,
        data.totalAmount,
        data.driveDate, data.driveTime, data.showroom, data.note ?? null,
        'pending_payment',
      ]
    );
 
    return { id: result.insertId, orderNumber };
  },
 
  // ── Lấy order theo ID ──
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0] ?? null;
  },
 
  // ── Lấy order theo order_number ──
  async findByOrderNumber(orderNumber) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    return rows[0] ?? null;
  },
 
  // ── Lấy tất cả order của 1 user (MongoDB user id) ──
  async findByUser(mongoUserId) {
    const [rows] = await pool.query(
      `SELECT o.*,
        (SELECT status FROM payments WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS payment_status
       FROM orders o
       WHERE o.mongo_user_id = ?
       ORDER BY o.created_at DESC`,
      [mongoUserId]
    );
    return rows;
  },
 
  // ── Admin: lấy tất cả orders, phân trang + filter ──
  async findAll({ status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let where = '1=1';
 
    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }
 
    const [rows] = await pool.query(
      `SELECT * FROM orders WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
 
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM orders WHERE ${where}`, params
    );
 
    return { orders: rows, total: countRows[0].total };
  },
 
  // ── Update status ──
  async updateStatus(id, newStatus, changedBy = 'system', note = null) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
 
      const [oldRows] = await conn.query('SELECT status FROM orders WHERE id = ?', [id]);
      const oldStatus = oldRows[0]?.status;
 
      await conn.query('UPDATE orders SET status = ? WHERE id = ?', [newStatus, id]);
 
      await conn.query(
        `INSERT INTO order_logs (order_id, old_status, new_status, changed_by, note)
         VALUES (?, ?, ?, ?, ?)`,
        [id, oldStatus, newStatus, changedBy, note]
      );
 
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
 
  // ── Thống kê cho Admin Dashboard ──
  async getStats() {
    const [[revenue]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total
       FROM orders WHERE status IN ('paid', 'confirmed', 'completed')`
    );
    const [[totalOrders]] = await pool.query(`SELECT COUNT(*) as total FROM orders`);
    const [[pendingCash]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders WHERE status = 'awaiting_cash'`
    );
    const [byPlan] = await pool.query(
      `SELECT plan_id, plan_name, COUNT(*) as count, SUM(total_amount) as revenue
       FROM orders WHERE status IN ('paid','confirmed','completed')
       GROUP BY plan_id, plan_name`
    );
    const [byMethod] = await pool.query(
      `SELECT p.method, COUNT(*) as count, SUM(p.amount) as total
       FROM payments p WHERE p.status = 'success'
       GROUP BY p.method`
    );
 
    return {
      totalRevenue: revenue.total,
      totalOrders: totalOrders.total,
      pendingCashOrders: pendingCash.total,
      byPlan,
      byMethod,
    };
  },
};