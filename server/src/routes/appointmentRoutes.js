const express = require('express');
const { body } = require('express-validator');
const {
  createAppointment,
  getAppointments,
  checkIn,
  cancelAppointment,
} = require('../controllers/appointmentController');
const verifyJWT = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

const createAppointmentRules = [
  body('patientId').notEmpty().withMessage('patientId is required'),
  body('scheduledDate').notEmpty().withMessage('scheduledDate is required'),
  body('scheduledTime').notEmpty().withMessage('scheduledTime is required'),
];

router.use(verifyJWT);

router.post('/', requireRole('receptionist'), createAppointmentRules, validate, createAppointment);
router.get('/', requireRole('receptionist', 'doctor'), getAppointments);
router.patch('/:id/check-in', requireRole('receptionist'), checkIn);
router.patch('/:id/cancel', requireRole('receptionist'), cancelAppointment);

module.exports = router;
