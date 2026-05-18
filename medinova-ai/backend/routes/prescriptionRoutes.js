const express = require('express');
const router = express.Router();
const { createPrescription, getPrescriptions, getPrescription, generatePrescriptionPDF } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getPrescriptions);
router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/:id', protect, getPrescription);
router.get('/:id/pdf', protect, generatePrescriptionPDF);

module.exports = router;
