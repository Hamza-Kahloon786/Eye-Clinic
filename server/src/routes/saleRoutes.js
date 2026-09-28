const express = require('express');
const { createSale, getSales, getSalesStats } = require('../controllers/saleController');
const verifyJWT = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.post('/', requireRole('receptionist', 'doctor'), createSale);
router.get('/', requireRole('doctor'), getSales);
router.get('/stats', requireRole('doctor'), getSalesStats);

module.exports = router;
