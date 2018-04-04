const checkAuth = require('../auth/checkAuth');
const ArchivesController = require('../controllers/archivesController');

module.exports = (app, baseRoute) => {

    // Create an archive
    app.post(baseRoute + '/', ArchivesController.createArchive);

    // Lists all archives
    app.get(baseRoute + '/', checkAuth, ArchivesController.listArchives);

    // Get a specific archive
    app.get(baseRoute + '/:id', ArchivesController.getArchive);

    // Delete a specific archive
    app.delete(baseRoute + '/:id', ArchivesController.deleteArchive);

};