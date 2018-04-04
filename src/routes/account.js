const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');

// Send register view
router.get('/register', UserController.getRegisterPage);

// Create a user
router.post('/register', UserController.createUser);

// Send login view
router.get('/login', UserController.getLoginPage);

// Authenticate a user
router.post('/login', UserController.loginUser);

// Get a specific user
// router.get('/:id', UserController.getUser);

// Delete a specific user
// router.delete('/:id', UserController.deleteUser);

module.exports = router;