const express = require('express');
const { getMedicines, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const verifyJWT = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/', requireRole('receptionist', 'doctor'), getMedicines);
router.post('/', requireRole('doctor'), createMedicine);
router.patch('/:id', requireRole('doctor'), updateMedicine);
router.delete('/:id', requireRole('doctor'), deleteMedicine);

module.exports = router;
