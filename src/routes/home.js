const HomeController = require('../controllers/homeController');

module.exports = (app, baseRoute) => {
    // Views
    app.get(baseRoute, HomeController.home);
    app.get(baseRoute + 'about',  HomeController.getAboutPage);
    app.get(baseRoute + 'archive',  HomeController.getArchivePage);
};