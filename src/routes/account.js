const UserController = require('../controllers/userController');

module.exports = (app, baseRoute) => {

    // Views
    app.get(baseRoute + '/edit', UserController.getEditPage);
    app.get(baseRoute + '/login', UserController.getLoginPage);
    app.get(baseRoute + '/register', UserController.getRegisterPage);
    app.get(baseRoute + '/password_reset', UserController.getPasswordResetPage);


    // Create a user
    app.post(baseRoute + '/register', UserController.createUser);

    // Authenticate a user
    app.post(baseRoute + '/login', UserController.loginUser);

    // Edit a user
    app.post(baseRoute + '/edit', UserController.editUser);

    // Reset user password
    app.post(baseRoute + '/password_reset', UserController.resetPassword);

    // Destroy a user session
    app.get(baseRoute + '/logout', UserController.logoutUser);

    // Get a specific user
    // app.get('/:id', UserController.getUser);

    // Delete a specific user
    // app.delete('/:id', UserController.deleteUser);

};
