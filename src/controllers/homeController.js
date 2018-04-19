exports.home = (req, res) => {
    res.render('home', { homePageActive: true });
};
