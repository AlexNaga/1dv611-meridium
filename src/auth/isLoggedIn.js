module.exports = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        req.session.redirectTo = req.path;
        res.redirect('/account/login');
    }
};