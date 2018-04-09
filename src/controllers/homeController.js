
exports.home = (req, res, next) => {
    res.render('home', { isStartPage: true });
};
