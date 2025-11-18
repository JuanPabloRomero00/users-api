const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeAdmin, authorizeSelfOrAdmin } = require('../middlewares/auth.middleware');

// Public registration and login
router.post('/register', userController.register);
router.post('/login', userController.login);

// Admin registration with secret key
router.post('/admin/register', userController.registerAdmin);

// Public password recovery
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// User management (admin only, requires JWT)
router.get('/', authenticateJWT, authorizeAdmin, userController.getAllUsers);
router.put('/:id', authenticateJWT, authorizeAdmin, userController.updateUser);
router.delete('/:id', authenticateJWT, authorizeAdmin, userController.deleteUser);

// Get user data by id (authenticated user or admin only, requires JWT)
router.get('/:id', authenticateJWT, authorizeSelfOrAdmin, userController.getMe);

module.exports = router;
