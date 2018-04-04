module.exports = (app) => {


    // combine routes
    // Second parameter is the base route.
    require('./home')(app, '/');
    require('./account')(app, '/account');
    require('./archive')(app, '/archive');
};
