const UserController = require('../controllers/userController');

module.exports = (app, baseRoute) => {

    // Send register view
    app.get(baseRoute + '/register', UserController.getRegisterPage);

    // Create a user
    app.post(baseRoute + '/register', UserController.createUser);

    // Send login view
    app.get(baseRoute + '/login', UserController.getLoginPage);

    // Authenticate a user
    app.post(baseRoute + '/login', UserController.loginUser);

    // Get a specific user
    // app.get('/:id', UserController.getUser);

    // Delete a specific user
    // app.delete('/:id', UserController.deleteUser);

};
