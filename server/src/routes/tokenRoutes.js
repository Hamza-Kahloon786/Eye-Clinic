const express = require('express');
const {
  createToken,
  getTodayQueue,
  getTokenById,
  updateTokenStatus,
  updateTokenDiagnosis,
} = require('../controllers/tokenController');
const verifyJWT = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.post('/', requireRole('receptionist'), createToken);
router.get('/today', requireRole('receptionist', 'doctor'), getTodayQueue);
router.get('/:id', requireRole('receptionist', 'doctor'), getTokenById);
router.patch('/:id/status', requireRole('doctor'), updateTokenStatus);
router.patch('/:id/diagnosis', requireRole('doctor'), updateTokenDiagnosis);

module.exports = router;
