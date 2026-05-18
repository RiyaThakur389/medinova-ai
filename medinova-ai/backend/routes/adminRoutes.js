const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllPatients, toggleUserStatus, getReports } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/patients', getAllPatients);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/reports', getReports);

module.exports = router;
