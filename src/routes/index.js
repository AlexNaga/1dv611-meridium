module.exports = (app) => {
    // Combine routes
    // Second parameter is the base route
    require('./home')(app, '/');
    require('./account')(app, '/account');
    require('./user')(app, '/profile');
    require('./archives')(app, '/archives');
};
