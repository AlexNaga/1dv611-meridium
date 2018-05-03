const Schedule = require('../models/schedules');
const Archive = require('../models/archive');
const { URL } = require('url');
const validUrl = require('valid-url');
const Setting = require('../models/enums').setting;

/**
 * Makes the urls user friendly for viewing (removes "http://" etc)
 * @param {[Schedule]} docs Array of Schedules
 */
function makeUserFriendlyUrls(docs) {
    for (let i = 0; i < docs.length; i++) {
        if (docs[i].typeOfSetting === Setting.ADVANCED) {
            docs[i].url = docs[i].advancedSetting.split(' ')[0];
        }
    }
    for (let i = 0; i < docs.length; i++) {
        const x = docs[i];
        x.url = (validUrl.isUri(x.url) ? new URL(x.url).hostname : x.url)

        if (x.includeDomains) {
            let subUrls = x.includeDomains.split(',');
            for (let j = 0; j < subUrls.length; j++) {
                subUrls[j] = (validUrl.isUri(subUrls[j]) ? new URL(subUrls[j]).hostname : subUrls[j])
            }
            x.includeDomains = subUrls.join(' ');
        }
    }
}

/**
 * GET /schedules/
 */
exports.listSchedule = (req, res) => {
    let page = req.query.p || 1;
    let itemsPerPage = 10;
    Schedule.paginate({ ownerId: req.session.user.id },
        {
            sort: { createdAt: 'desc' },
            page: page,
            limit: itemsPerPage
        })
        .then(data => {
            makeUserFriendlyUrls(data.docs);

            res.render('schedule/index', {
                active: { schedule: true },
                loadScheduleScripts: true,

                // pagination below
                docs: data.docs,
                total: data.total,
                limit: data.limit,
                pagination: {
                    page: data.page,
                    pageCount: data.pages,
                }
            })
        })
        .catch((err) => {
            console.log(err)
            req.session.flash = {
                message: 'Kunde ej lista sparade schemalgda arkiveringar!',
                danger: true
            }
            return res.redirect('/');
        });
}

/**
 * GET /schedules/edit/:id
 */
exports.getSchedule = async (req, res) => {
    let page = req.query.p || 1;
    let itemsPerPage = 10;

    Schedule.findOne({ _id: req.params.id }).exec()
        .then((schedule) => {
            Archive.paginate(
                {
                    ownerId: req.session.user.id,
                    fromSchedule: schedule._id
                },
                {
                    sort: { createdAt: 'desc' },
                    page: page,
                    limit: itemsPerPage
                })
                .then(archives => {
                    res.render('schedule/edit', {
                        schedule: schedule,
                        active: { schedule: true },
                        loadScheduleScripts: true,
                        // pagination below
                        docs: archives.docs,
                        total: archives.total,
                        limit: archives.limit,
                        pagination: {
                            page: archives.page,
                            pageCount: archives.pages,
                        }
                    })
                })
                .catch((err) => {
                    throw err;
                });
        })
        .catch((err) => {
            console.log(err)
            req.session.flash = {
                message: 'Något gick fel vid hämtning av schemaläggningen!',
                danger: true
            }
            return res.redirect('/schedules');
        });
};

/**
 * POST /schedules/edit/:id
 */
exports.updateSchedule = async (req, res) => {
    let id = req.params.id;

    Schedule.findByIdAndUpdate(id, {
        $set: {
            url: req.body.url,
            advancedSetting: req.body.advancedSetting,
            includeDomains: req.body.includeDomains,
            excludePaths: req.body.excludePaths,
            robots: req.body.robots,
            structure: req.body.structure,
            typeOfSchedule: req.body.typeOfSchedule,
            email: req.body.email,
            shouldNotify: req.body.shouldNotify === 'on', // checked = 'on', else shouldNotify is omitted
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
            return res.redirect('/schedules');
        });
}

/**
 * POST/DELETE /schedules/delete/:id
 */
exports.deleteSchedule = (req, res) => {
    Schedule.findOneAndRemove({ _id: req.params.id }).exec()
        .then((schedule) => {
            req.session.flash = {
                message: 'Schemaläggningen har tagits bort!',
                success: true
            };

            res.status(200).json({
                deleted: schedule.fileName
            });
        })
        .catch((err) => {
            console.log(err);
            // err.code ENOENT = No such file on disk, but removed entry removed from db.
            req.session.flash = {
                message: 'Vi kunde inte ta bort schemainställningen!',
                danger: true
            };

            return res.redirect('/schedules');
        });
};

// POST /schedule/pause/:id
exports.pauseSchedule = (req, res) => {
    let id = req.params.id;
    Schedule.findById(id)
        .then((schedule) => {
            schedule.isPaused = !schedule.isPaused;
            return schedule.save();
        })
        .then((doc) => {
            res.json({ success: true });
        })
        .catch((err) => {
            res.json({ success: false, message: err });
        });
}