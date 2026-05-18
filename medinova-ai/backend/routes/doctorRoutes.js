const express = require('express');
const router = express.Router();
const {
  getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor,
  getDoctorAppointments, getDoctorPatients
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.post('/', protect, authorize('admin'), createDoctor);
router.put('/:id', protect, authorize('admin', 'doctor'), updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);
router.get('/:id/appointments', protect, authorize('admin', 'doctor'), getDoctorAppointments);
router.get('/:id/patients', protect, authorize('admin', 'doctor'), getDoctorPatients);

module.exports = router;
