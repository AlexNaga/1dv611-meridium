const Archive = require('../models/archive');

exports.home = (req, res) => {
    if (!req.session.user) return res.render('home', { homePageActive: true });

    let page = req.query.p || 1;
    let itemsPerPage = 10;

    Archive.paginate({ ownerId: req.session.user.id },
        {
            sort: { createdAt: 'desc' },
            page: page,
            limit: itemsPerPage
        })
        .then(data =>
            res.render('home', {
                docs: data.docs,
                total: data.total,
                limit: data.limit,
                pagination: {
                    page: data.page,
                    pageCount: data.pages,
                },
                homePageActive: true,
                loadArchiveScripts: true
            })
        )
        .catch((err) => {
            res.status(400).json({
                error: err
            });
        });
    // res.render('home');
};