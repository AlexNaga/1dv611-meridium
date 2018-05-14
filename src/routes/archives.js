const ArchivesController = require('../controllers/archivesController');
const isLoggedIn = require('../auth/isLoggedIn');

module.exports = (app, baseRoute) => {
    // Create an archive
    app.post(baseRoute + '/', isLoggedIn, ArchivesController.createArchive);

    // Lists all archives
    app.get(baseRoute + '/', isLoggedIn, ArchivesController.listSchedule);
    
     // Get a specific schedule
    app.get(baseRoute + '/edit/:id', isLoggedIn, ArchivesController.getSchedule);

    // Update a specific schedule
    app.post(baseRoute + '/edit/:id', isLoggedIn, ArchivesController.updateSchedule);

    // Download a specific archive
    app.get(baseRoute + '/:id', isLoggedIn, ArchivesController.downloadArchive);

    // Preview a specific archive
    app.get(baseRoute + '/preview/:id', isLoggedIn, ArchivesController.previewArchive);

    // Delete a specific archive
    app.delete(baseRoute + '/delete/:id', isLoggedIn, ArchivesController.deleteArchive);
};