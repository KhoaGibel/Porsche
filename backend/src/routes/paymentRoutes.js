import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  createPayment, getOrder, getMyOrders,
  confirmCashPayment, momoWebhook,
} from '../controllers/paymentController.js';
 
const router = Router();
 
// Public — không bắt buộc login (guest checkout được, req.user sẽ undefined)
// Nếu muốn bắt buộc login, thêm `protect` vào đây
router.post('/create', protect,  createPayment);
 
router.get('/order/:orderNumber', protect, getOrder);
router.get('/my',        protect, getMyOrders);
 
// Admin/Dealer xác nhận tiền mặt
router.post('/:orderId/confirm-cash', protect, confirmCashPayment);
 
// Webhook — MoMo/VNPay gọi vào, KHÔNG qua protect (họ không có JWT của mình)
router.post('/webhook/momo', momoWebhook);
 
export default router;