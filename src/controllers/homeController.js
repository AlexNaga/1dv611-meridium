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
        }
    });
};

exports.getAboutPage = (req, res) => {
    res.render('about/index', {
        active: {
            about: true
        },
    });
};

exports.getArchivePage = (req, res) => {
    res.render('archive/index', {
        active: {
            archive: true
        },
        loadIndexScripts: true
    });
};