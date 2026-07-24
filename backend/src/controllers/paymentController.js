import { OrderModel }   from '../models/orderModel.js';
import { PaymentModel } from '../models/paymentModel.js';
import crypto from 'crypto';
 
// ─────────────────────────────────────────────
// POST /api/payments/create
// Tạo order + khởi tạo payment, trả về paymentUrl nếu cần redirect
// ─────────────────────────────────────────────
export const createPayment = async (req, res) => {
  try {
    const {
      fullName, email, phone, idCard, dob, address,
      driveDate, driveTime, showroom, note,
      planId, planName, insuranceId, insuranceName,
      basePrice, insurancePrice, totalAmount,
      paymentMethod,
      cardNumber, cardName, cardExpiry, // KHÔNG lưu CVV, KHÔNG lưu full số thẻ
    } = req.body;
 
    // ── Validate cơ bản ──
    if (!fullName || !phone || !email || !idCard) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin cá nhân.' });
    }
    if (!driveDate || !driveTime || !showroom) {
      return res.status(400).json({ message: 'Vui lòng chọn ngày, giờ và showroom.' });
    }
    if (!['momo', 'vnpay', 'atm', 'visa', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ.' });
    }
 
    // ── Tạo order trong MySQL ──
    const mongoUserId = req.user?._id?.toString() ?? null; // từ JWT nếu đã login
 
    const { id: orderId, orderNumber } = await OrderModel.create({
      mongoUserId,
      fullName, email, phone, idCard, dob, address,
      planId, planName, basePrice,
      insuranceId, insuranceName, insurancePrice,
      totalAmount,
      driveDate, driveTime, showroom, note,
    });
 
    // ── Xử lý riêng cho từng phương thức ──
 
    // 💵 TIỀN MẶT — không redirect, đơn ở trạng thái chờ thu tại showroom
    if (paymentMethod === 'cash') {
      await PaymentModel.create({
        orderId, method: 'cash', amount: totalAmount, status: 'pending',
      });
      await OrderModel.updateStatus(orderId, 'awaiting_cash', 'customer', 'Chọn thanh toán tiền mặt');
 
      return res.status(201).json({
        orderNumber,
        orderId,
        message: 'Đơn đã được ghi nhận. Vui lòng thanh toán tiền mặt tại showroom.',
        requiresCashPayment: true,
        // Không có paymentUrl — frontend sẽ hiện màn hình success với cảnh báo đỏ
      });
    }
 
    // 💳 VISA/MASTERCARD — chỉ lưu 4 số cuối, không lưu CVV/full number
    if (paymentMethod === 'visa') {
      if (!cardNumber || !cardName || !cardExpiry) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin thẻ.' });
      }
      const cleanNumber = cardNumber.replace(/\s/g, '');
      if (cleanNumber.length !== 16) {
        return res.status(400).json({ message: 'Số thẻ không hợp lệ.' });
      }
      const last4 = cleanNumber.slice(-4);
      const brand = cleanNumber.startsWith('4') ? 'visa' : 'mastercard';
 
      await PaymentModel.create({
        orderId, method: 'visa', amount: totalAmount, status: 'pending',
        cardLast4: last4, cardBrand: brand,
      });
 
      // Trong thực tế: gọi cổng thanh toán thẻ thật (Stripe/PayOS/OnePay...)
      // Ở đây giả lập xử lý thành công ngay (demo)
      await OrderModel.updateStatus(orderId, 'paid', 'system', 'Thanh toán thẻ thành công');
 
      return res.status(201).json({
        orderNumber, orderId,
        message: 'Thanh toán thành công!',
      });
    }
 
    // 🏦 ATM / Internet Banking — redirect sang cổng ngân hàng
    if (paymentMethod === 'atm') {
      const paymentId = await PaymentModel.create({
        orderId, method: 'atm', amount: totalAmount, status: 'initiated',
      });
 
      // TODO: tích hợp cổng thanh toán ATM thật (NAPAS/OnePay)
      const paymentUrl = buildAtmGatewayUrl({ orderId, orderNumber, amount: totalAmount, paymentId });
 
      return res.status(201).json({ orderNumber, orderId, paymentUrl });
    }
 
    // 💜 MOMO
    if (paymentMethod === 'momo') {
      const paymentId = await PaymentModel.create({
        orderId, method: 'momo', amount: totalAmount, status: 'initiated',
      });
 
      const paymentUrl = await buildMomoPaymentUrl({ orderId, orderNumber, amount: totalAmount, paymentId });
 
      return res.status(201).json({ orderNumber, orderId, paymentUrl });
    }
 
    // 🔴 VNPAY
    if (paymentMethod === 'vnpay') {
      const paymentId = await PaymentModel.create({
        orderId, method: 'vnpay', amount: totalAmount, status: 'initiated',
      });
 
      const paymentUrl = buildVnpayUrl({ orderId, orderNumber, amount: totalAmount, paymentId, req });
 
      return res.status(201).json({ orderNumber, orderId, paymentUrl });
    }
 
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ message: 'Lỗi xử lý thanh toán. Vui lòng thử lại.', error: err.message });
  }
};
 
// ─────────────────────────────────────────────
// GET /api/payments/order/:orderNumber — tra cứu đơn
// ─────────────────────────────────────────────
export const getOrder = async (req, res) => {
  try {
    const order = await OrderModel.findByOrderNumber(req.params.orderNumber);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
 
    const payments = await PaymentModel.findByOrderId(order.id);
    res.json({ order, payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// ─────────────────────────────────────────────
// GET /api/payments/my — đơn của user đang đăng nhập
// ─────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await OrderModel.findByUser(req.user._id.toString());
    res.json({ total: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// ─────────────────────────────────────────────
// POST /api/payments/:orderId/confirm-cash
// Admin/Dealer xác nhận đã thu tiền mặt tại showroom
// ─────────────────────────────────────────────
export const confirmCashPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const confirmedBy = req.user.fullName ?? req.user.email;
 
    const success = await PaymentModel.confirmCash(orderId, confirmedBy);
    if (!success) return res.status(404).json({ message: 'Không tìm thấy giao dịch tiền mặt cho đơn này.' });
 
    await OrderModel.updateStatus(orderId, 'confirmed', confirmedBy, 'Đã xác nhận thu tiền mặt');
 
    res.json({ message: 'Đã xác nhận thanh toán tiền mặt.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// ─────────────────────────────────────────────
// Webhook — MoMo/VNPay gọi về khi thanh toán xong
// ─────────────────────────────────────────────
export const momoWebhook = async (req, res) => {
  try {
    const { orderId: paymentId, resultCode, transId } = req.body;
    const status = resultCode === 0 ? 'success' : 'failed';
 
    await PaymentModel.updateStatus(paymentId, status, { txnId: transId, raw: req.body });
 
    if (status === 'success') {
      const payments = await PaymentModel.findByOrderId(req.body.orderInfo?.orderId);
      // Cập nhật order sang 'paid'
    }
 
    res.status(200).json({ message: 'OK' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// ── Helper functions xây URL cổng thanh toán (placeholder — điền config thật) ──
function buildAtmGatewayUrl({ orderId, orderNumber, amount, paymentId }) {
  // TODO: thay bằng tích hợp NAPAS/OnePay thật
  return `https://sandbox.onepay.vn/pay?orderNumber=${orderNumber}&amount=${amount}&returnUrl=${process.env.FRONTEND_URL}/payment/return`;
}
 
async function buildMomoPaymentUrl({ orderId, orderNumber, amount, paymentId }) {
  // TODO: gọi MoMo API thật — cần partnerCode, accessKey, secretKey từ MoMo Business
  // Docs: https://developers.momo.vn
  return `https://test-payment.momo.vn/v2/gateway/pay?orderId=${orderNumber}&amount=${amount}`;
}
 
function buildVnpayUrl({ orderId, orderNumber, amount, paymentId, req }) {
  // TODO: gọi VNPay API thật — cần vnp_TmnCode, vnp_HashSecret
  // Docs: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
  return `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=${orderNumber}&vnp_Amount=${amount * 100}`;
}