module.exports = (app) => {


    require('./home')(app, '/');

    // combine routes
    // Second parameter is the base route.
    // require('./account')(app, '/account');
    // require('./archive')(app, '/archive');
};
