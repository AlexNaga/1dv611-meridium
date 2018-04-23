const checkAuth = require('../auth/checkAuth');
const ArchivesController = require('../controllers/archivesController');
const isLoggedIn = require('../auth/isLoggedIn');

module.exports = (app, baseRoute) => {

    // Create an archive
    app.post(baseRoute + '/', isLoggedIn, ArchivesController.createArchive);

    // Lists all archives
    app.get(baseRoute + '/', isLoggedIn, ArchivesController.listArchives);

    // Get a specific archive
    app.get(baseRoute + '/:id', isLoggedIn, ArchivesController.getArchive);

    // Preview a specific archive
    app.get(baseRoute + '/preview/:id', isLoggedIn, ArchivesController.previewArchive);

    // Delete a specific archive
    app.delete(baseRoute + '/:id', isLoggedIn, ArchivesController.deleteArchive);
};