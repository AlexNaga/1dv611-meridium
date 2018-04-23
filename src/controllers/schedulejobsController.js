const Schedule = require('../models/scheduledJobs');
const Archive = require('../models/archive');

exports.listSchedule = (req, res) => {
    if (req.session.user) {
        let page = req.query.page || 0;
        let itemsPerPage = 10;
        Schedule.find({ ownerId: req.session.user.id })
            .sort({ createdAt: 'desc' })
            .skip(page * itemsPerPage)
            .limit(itemsPerPage)
            .then(data => res.render('schedule/index', {
                data,
                schedulePageActive: true
            }))
            .catch((err) => {
                res.status(400).json({
                    error: err
                });
            });
    } else {
        res.redirect('account/login')
    }
}

exports.getSchedule = async (req, res) => {
    if (req.session.user) {
        Schedule.findOne({ _id: req.params.id }).exec()
            .then((schedule) => {
                Archive.find(
                    {
                        ownerId: req.session.user.id,
                        fromSchedule: schedule._id
                    })
                    .sort({ createdAt: 'desc' })
                    // .skip(page * itemsPerPage)
                    // .limit(itemsPerPage)
                    .then((archives) => {
                        console.log('archives', archives);

                        res.render('schedule/edit', { schedule, archives });
                    })
                    .catch((err) => {
                        throw err;
                    });
            })
            .catch((err) => {
                res.status(400).json({
                    error: err
                });
            });
    } else {
        res.redirect('account/login')
    }
};

exports.updateSchedule = async (req, res) => {
    if (req.session.user) {
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
                return res.redirect('/schedules');
            })
            .catch((err) => {
                console.log(err)
                req.session.flash = {
                    message: 'Vi kunde inte uppdatera schemainställningarna!',
                    danger: true
                }
            })
    } else {
        res.redirect('account/login')
    }
}

exports.deleteSchedule = (req, res) => {
    if (req.session.user) {
        Schedule.findOneAndRemove({ _id: req.params.id }).exec()
            .then(() => {
                req.session.flash = {
                    message: 'Schemaläggningen har tagits bort!',
                    success: true
                };

                return res.redirect('/schedules');
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
    } else {
        res.redirect('account/login')
    }
};

exports.getEditPage = (req, res) => {
    if (req.session.user) {
        res.render('schedule/edit', { id: req.params.id });
    } else {
        res.redirect('account/login')
    }
};
