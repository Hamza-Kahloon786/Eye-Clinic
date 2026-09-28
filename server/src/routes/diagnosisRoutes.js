const express = require('express');
const {
  getDiagnoses,
  createDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
} = require('../controllers/diagnosisController');
const verifyJWT = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/', requireRole('receptionist', 'doctor'), getDiagnoses);
router.post('/', requireRole('doctor'), createDiagnosis);
router.patch('/:id', requireRole('doctor'), updateDiagnosis);
router.delete('/:id', requireRole('doctor'), deleteDiagnosis);

module.exports = router;
