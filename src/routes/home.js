const HomeController = require('../controllers/homeController');

module.exports = (app, baseRoute) => {
    // Startpage
    app.get(baseRoute, HomeController.home);
};