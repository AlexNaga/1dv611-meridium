const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');

// Create a user
router.post('/register', UserController.createUser);

// Authenticate a user
router.post('/login', UserController.loginUser);

// Send login view
router.get('/login', UserController.getLoginPage);

// Get a specific user
// router.get('/:id', UserController.getUser);

// Delete a specific user
// router.delete('/:id', UserController.deleteUser);

module.exports = router;