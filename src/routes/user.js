const UserController = require('../controllers/userController');

module.exports = (app, baseRoute) => {

    // Views
    app.get(baseRoute + '/edit', UserController.getEditPage);

    // Edit a user
    app.post(baseRoute + '/edit', UserController.editUser);

    // Get a specific user
    // app.get('/:id', UserController.getUser);

    // Delete a specific user
    // app.delete('/:id', UserController.deleteUser);

};
