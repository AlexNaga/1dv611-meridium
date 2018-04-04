const HomeController = require('../controllers/homeController');

module.exports = (app, baseRoute) => {

    app.get(baseRoute, HomeController.home);

    // app.get(baseRoute + '/test', );

    // app.get(baseRoute + '/validate',);
};