const express = require('express');
const { body } = require('express-validator');
const {
  searchPatients,
  createPatient,
  getPatientById,
  updatePatient,
  getPatientTokens,
} = require('../controllers/patientController');
const { getPatientRecords } = require('../controllers/clinicalRecordController');
const { getPatientSuggestions } = require('../controllers/glassesSuggestionController');
const verifyJWT = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

const patientFieldRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Age must be a valid number'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
];

router.use(verifyJWT);

router.get('/search', requireRole('receptionist', 'doctor'), searchPatients);
router.post('/', requireRole('receptionist'), patientFieldRules, validate, createPatient);
router.get('/:id', requireRole('receptionist', 'doctor'), getPatientById);
router.patch('/:id', requireRole('receptionist'), patientFieldRules, validate, updatePatient);
router.get('/:id/tokens', requireRole('receptionist', 'doctor'), getPatientTokens);
router.get('/:id/records', requireRole('receptionist', 'doctor'), getPatientRecords);
router.get('/:id/glasses', requireRole('doctor', 'optical'), getPatientSuggestions);

module.exports = router;
