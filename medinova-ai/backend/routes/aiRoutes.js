const express = require('express');
const router = express.Router();
const { symptomChecker, aiChat, prescriptionAssistant, reportSummary } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/symptom-check', protect, symptomChecker);
router.post('/chat', protect, aiChat);
router.post('/prescription-assist', protect, authorize('doctor'), prescriptionAssistant);
router.post('/report-summary', protect, reportSummary);

module.exports = router;
