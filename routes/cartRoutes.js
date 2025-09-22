import express from 'express';
import { getCart, saveCart } from '../controllers/cartController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/get', protect, getCart);
router.post('/save', protect, saveCart);

export default router;
