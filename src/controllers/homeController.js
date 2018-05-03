const Archive = require('../models/archive');

/**
 * GET /
 */
exports.home = (req, res) => {
    if (!req.session.user) {
        return res.render('home', {
            active: {
                home: true
            },
        });
    }

    res.render('home', {
        active: {
            home: true
        },
        loadIndexScripts: true,
        loadArchiveScripts: true
    });
};

exports.getAboutPage = (req, res) => {
    res.render('about/index', {
        active: {
            about: true
        },
    });
};