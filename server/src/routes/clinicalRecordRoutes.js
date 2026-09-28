const express = require('express');
const {
  createRecord,
  getAllRecords,
  getPatientsWithRecords,
  getRecordById,
  getRecordByToken,
  deleteRecord,
} = require('../controllers/clinicalRecordController');
const verifyJWT = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.post('/', requireRole('doctor'), createRecord);
router.get('/', requireRole('doctor'), getAllRecords);
router.get('/patients', requireRole('doctor'), getPatientsWithRecords);
router.get('/by-token/:tokenId', requireRole('receptionist', 'doctor'), getRecordByToken);
router.get('/:id', requireRole('receptionist', 'doctor'), getRecordById);
router.delete('/:id', requireRole('doctor'), deleteRecord);

module.exports = router;
