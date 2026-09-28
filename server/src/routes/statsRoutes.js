const express = require('express');
const { getDashboardStats } = require('../controllers/statsController');
const verifyJWT = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/dashboard', requireRole('receptionist', 'doctor'), getDashboardStats);

module.exports = router;
