const User = require('../models/User');
const mongoose = require('mongoose'); // For checking ObjectId validity

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper function to get user by either MongoDB ObjectId or custom ID
const getUserByIdOrCustomId = async (id) => {
    if (isValidObjectId(id)) {
        return User.findById(id).exec();
    } else {
        return User.findOne({ id }).exec(); // Use custom ID field name here
    }
};

// Get all users (admins can view all users, instructors can view only students)
const getAllUsers = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            // Admin can view all users
            const users = await User.find().select("-password").lean();
            return res.status(200).json(users);
        } else if (req.user.role === 'instructor') {
            // Instructor can view only students
            const students = await User.find({ role: 'student' }).select("-password").lean();
            return res.status(200).json(students);
        } else {
            // Other roles should not access this endpoint
            return res.status(403).json({ error: 'Access denied' });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user by ID (admins can get any user, instructors can get students, users can only get their own profile)
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await getUserByIdOrCustomId(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the current user is allowed to view this user
        if (req.user.role === 'admin' ||
            (req.user.role === 'instructor' && user.role === 'student') ||
            req.user.id === user._id.toString()) {
            return res.status(200).json(user);
        }

        return res.status(403).json({ error: 'Access denied' });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user (admins can update any user, students and instructors can only update their own email and password)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const user = await getUserByIdOrCustomId(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent non-admin users from changing roles
        if (updateData.role && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Students can only update their own email and password
        if (req.user.role === 'student' && req.user.id !== user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // instructors can only update their own email and password
        if (req.user.role === 'instructor' && req.user.id !== user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Update user data
        const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true }).exec();
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete user (admins can delete any user, students can only delete their own profile)
// Delete user (admins can delete any user, instructors can delete their own profile, students can delete their own profile)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await getUserByIdOrCustomId(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the current user is authorized to delete this user
        if (req.user.role === 'admin' || req.user.id === user._id.toString()) {
            await User.findByIdAndDelete(user._id).exec(); // Ensure you're deleting by MongoDB ObjectId
            return res.status(200).json({ message: 'User deleted successfully' });
        }

        return res.status(403).json({ error: 'Access denied' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};