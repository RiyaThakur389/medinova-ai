const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Update own profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true });
  res.json({ success: true, user });
}));

// Get all users (admin)
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
}));

// Delete user (admin)
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
}));

module.exports = router;
