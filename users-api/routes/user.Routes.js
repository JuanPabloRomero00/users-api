const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeAdmin, authorizeSelfOrAdmin } = require('../middlewares/auth.middleware');

// Registro y login públicos
router.post('/register', userController.register);
router.post('/login', userController.login);

// Registro de administrador con clave secreta
router.post('/admin/register', userController.registerAdmin);

// Recuperación de contraseña pública
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Gestión de usuarios (solo admin, requiere JWT)
router.get('/', authenticateJWT, authorizeAdmin, userController.getAllUsers);
router.put('/:id', authenticateJWT, authorizeAdmin, userController.updateUser);
router.delete('/:id', authenticateJWT, authorizeAdmin, userController.deleteUser);

// Obtener datos del usuario por id (solo usuario autenticado o admin, requiere JWT)
router.get('/:id', authenticateJWT, authorizeSelfOrAdmin, userController.getMe);

module.exports = router;
