const ProfileController = require('../controllers/profileController');

module.exports = (app, baseRoute) => {

    // Views
    app.get(baseRoute + '/edit', ProfileController.getEditPage);

    // Edit a user
    app.post(baseRoute + '/edit', ProfileController.editUser);

    // Get a specific user
    // app.get('/:id', UserController.getUser);

    // Delete a specific user
    // app.delete('/:id', UserController.deleteUser);

};
