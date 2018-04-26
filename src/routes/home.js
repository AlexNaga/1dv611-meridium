const HomeController = require('../controllers/homeController');

module.exports = (app, baseRoute) => {
    // Startsida
    app.get(baseRoute, HomeController.home);

    //Om oss
    app.get(baseRoute + 'about',  HomeController.getAboutPage);

};

