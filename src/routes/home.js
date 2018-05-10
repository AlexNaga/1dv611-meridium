const HomeController = require('../controllers/homeController');
const isLoggedIn = require('../auth/isLoggedIn');

module.exports = (app, baseRoute) => {
    // Views
    app.get(baseRoute, HomeController.home);
    app.get(baseRoute + 'about', HomeController.getAboutPage);
    app.get(baseRoute + 'archive', isLoggedIn, HomeController.getArchivePage);
};