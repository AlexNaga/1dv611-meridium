const AccountController = require('../controllers/accountController');

module.exports = (app, baseRoute) => {
    // Views
    app.get(baseRoute + '/login', AccountController.getLoginPage);
    app.get(baseRoute + '/register', AccountController.getRegisterPage);
    app.get(baseRoute + '/forgot-password', AccountController.getPasswordResetPage);
    app.get(baseRoute + '/reset-password/:temporaryCode', AccountController.validateLink);

    // Create a user
    app.post(baseRoute + '/register', AccountController.createUser);

    // Authenticate a user
    app.post(baseRoute + '/login', AccountController.loginUser);

    // Reset user password
    app.post(baseRoute + '/forgot-password', AccountController.resetPassword);

    // Update password when asked for resetlink
    app.post(baseRoute + '/reset-password/:temporaryCode', AccountController.updatePassword);

    // Destroy a user session
    app.post(baseRoute + '/logout', AccountController.logoutUser);
};
