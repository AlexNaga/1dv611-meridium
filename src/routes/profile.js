const ProfileController = require('../controllers/profileController');
const isLoggedIn = require('../auth/isLoggedIn');

module.exports = (app, baseRoute) => {
    // Views
    app.get(baseRoute + '/edit', isLoggedIn, ProfileController.getEditPage);

    // Edit a user
    app.post(baseRoute + '/edit', isLoggedIn, ProfileController.editUser);
};