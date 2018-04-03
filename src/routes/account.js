var express = require('express');
var router = express.Router();

const UserController = require('../controllers/userController');

// Create a user
router.post('/register', UserController.createUser);

// Authenticate a user
router.post('/login', UserController.loginUser);

// Get a specific user
// router.get('/:id', UserController.getUser);

// Delete a specific user
// router.delete('/:id', UserController.deleteUser);

module.exports = router;