const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');

// Apply JWT verification middleware to all routes in this file
router.use(verifyJWT);

// Define routes with role-based access control
router.route('/')
    .get(authorizeRoles('admin', 'instructor'), userController.getAllUsers); // Only admin can get all users

router.route('/:id')
    .get(authorizeRoles('admin', 'instructor', 'student'), userController.getUserById) // Admin and instructor can get user by ID
    .put(authorizeRoles('admin', 'instructor', 'student'), userController.updateUser) // Admin and instructor can update user
    .delete(authorizeRoles('admin', 'instructor', 'student'), userController.deleteUser); // Only admin can delete user

module.exports = router;

