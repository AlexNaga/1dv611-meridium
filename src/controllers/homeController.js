const Archive = require('../models/archive');

exports.home = (req, res) => {
    if (!req.session.user) return res.render('home', { homePageActive: true });

    Archive.find({ ownerId: req.session.user.id })
        .sort({ createdAt: 'desc' })
        // .skip(page * itemsPerPage)
        // .limit(itemsPerPage)
        .then(data => res.render('home', {
            archives: data,
            homePageActive: true,
            loadArchiveScripts: true
        }))
        .catch((err) => {
            res.status(400).json({
                error: err
            });
        });
    // res.render('home');
};