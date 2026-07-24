import pool from '../config/mysql.js';
 
export const PaymentModel = {
 
  // ── Tạo payment record ──
  async create(data) {
    const [result] = await pool.query(
      `INSERT INTO payments (
        order_id, method, amount, status,
        card_last4, card_brand
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.orderId, data.method, data.amount, data.status ?? 'initiated',
        data.cardLast4 ?? null, data.cardBrand ?? null,
      ]
    );
    return result.insertId;
  },
 
  // ── Update trạng thái payment (webhook từ MoMo/VNPay gọi vào) ──
  async updateStatus(id, status, gatewayData = {}) {
    await pool.query(
      `UPDATE payments SET
        status = ?,
        gateway_txn_id = ?,
        gateway_response = ?
       WHERE id = ?`,
      [
        status,
        gatewayData.txnId ?? null,
        JSON.stringify(gatewayData),
        id,
      ]
    );
  },
 
  // ── Xác nhận thanh toán tiền mặt (Admin/Dealer bấm tại showroom) ──
  async confirmCash(orderId, confirmedBy) {
    const [result] = await pool.query(
      `UPDATE payments SET
        status = 'success',
        cash_confirmed_by = ?,
        cash_confirmed_at = NOW()
       WHERE order_id = ? AND method = 'cash'`,
      [confirmedBy, orderId]
    );
    return result.affectedRows > 0;
  },
 
  // ── Lấy payment theo order_id ──
  async findByOrderId(orderId) {
    const [rows] = await pool.query(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );
    return rows;
  },
 
  // ── Lấy payment theo gateway_txn_id (dùng khi webhook callback) ──
  async findByGatewayTxnId(txnId) {
    const [rows] = await pool.query(
      'SELECT * FROM payments WHERE gateway_txn_id = ?', [txnId]
    );
    return rows[0] ?? null;
  },
};