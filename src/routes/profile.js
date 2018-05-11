const ProfileController = require('../controllers/profileController');
const isLoggedIn = require('../auth/isLoggedIn');

module.exports = (app, baseRoute) => {
    // Views
    app.get(baseRoute + '/', isLoggedIn, ProfileController.getEditPage);

    // Edit a user
    app.post(baseRoute + '/', isLoggedIn, ProfileController.editUser);
};