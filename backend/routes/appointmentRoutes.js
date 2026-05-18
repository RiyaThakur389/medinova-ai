const express = require('express');
const router = express.Router();
const {
  getAppointments, getAppointment, bookAppointment,
  updateAppointmentStatus, cancelAppointment, getAvailableSlots
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAppointments);
router.post('/', protect, authorize('patient', 'admin'), bookAppointment);
router.get('/slots/:doctorId', getAvailableSlots);
router.get('/:id', protect, getAppointment);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;
