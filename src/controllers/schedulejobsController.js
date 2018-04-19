const Schedule = require('../models/scheduledJobs');

exports.listSchedule = (req, res) => {
    let page = req.query.page || 0;
    let itemsPerPage = 10;

    Schedule.find({ ownerId: req.session.user.id })
        .sort({ createdAt: 'desc' })
        .skip(page * itemsPerPage)
        .limit(itemsPerPage)
        .then(data => res.render('schedule/index', { data }))
        .catch((err) => {
            res.status(400).json({
                error: err
            });
        });
}

exports.getSchedule = async (req, res) => {
    Schedule.findOne({ _id: req.params.id }).exec()
        .then((data) => {
            res.render('schedule/edit', { schedule: data });
        })
        .catch((err) => {
            res.status(400).json({
                error: err
            });
        });
};

exports.updateSchedule = async (req, res) => {
    Schedule.findByIdAndUpdate({
        _id: req.params.id
    }, {
        $set: {
            url: req.body.url,
            includeDomains: req.body.includeDomains,
            excludePaths: req.body.excludePaths,
            robots: req.body.robots,
            structure: req.body.structure,
            schedule: req.body.typeOfSchedule,
            email: req.body.email,
            action: req.body.typeOfSetting

        }
        })
        .then(() => {
            req.session.flash = {
                message: 'Schemaläggningen har uppdaterats!',
                success: true
            };
            return res.redirect('/schedule');
        })
        .catch((err) => {
            console.log(err)
            req.session.flash = {
                message: 'Vi kunde inte uppdatera schemainställningarna!',
                danger: true
            }
        })
}


exports.deleteSchedule = (req, res) => {
    Schedule.findOneAndRemove({ _id: req.params.id }).exec()
        .then(() => {
            req.session.flash = {
                message: 'Schemaläggningen har tagits bort!',
                success: true
            };

            return res.redirect('/schedule');
        })
        .catch((err) => {
            console.log(err);
            // err.code ENOENT = No such file on disk, but removed entry removed from db.
            req.session.flash = {
                message: 'Vi kunde inte ta bort schemainställningen!',
                danger: true
            };

            return res.redirect('/');
        });
};


exports.getEditPage = (req, res) => {
    res.render('schedule/edit', { id: req.params.id });
};