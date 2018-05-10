const Schedule = require('../models/schedules');
const Archive = require('../models/archive');
const httrackWrapper = require('../models/httrackWrapper');
const validateHttrackSettings = require('../utils/validateHttrackSettings');

/**
 * GET /schedules/
 */
exports.listSchedule = async (req, res) => {
    try {
        let page = req.query.p || 1;
        let itemsPerPage = 10;
        let schedule = await Schedule.paginate({
            ownerId: req.session.user.id
        }, {
                sort: {
                    createdAt: 'desc'
                },
                page: page,
                limit: itemsPerPage
            });

        res.render('schedule/index', {
            active: {
                schedule: true
            },
            loadScheduleScripts: true,

            // Pagination below
            docs: schedule.docs,
            total: schedule.total,
            limit: schedule.limit,
            pagination: {
                page: schedule.page,
                pageCount: schedule.pages,
            }
        });
    } catch (err) {
        req.session.flash = {
            message: 'Kunde inte lista sparade schemalagda arkiveringar!',
            danger: true
        };
        return res.redirect('/');
    }
};

/**
 * GET /schedules/edit/:id
 */
exports.getSchedule = async (req, res) => {
    try {
        let page = req.query.p || 1;
        let itemsPerPage = 10;

        let schedule = await Schedule.findOne({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();

        let archives = await Archive.paginate({
            ownerId: req.session.user.id,
            fromSchedule: schedule._id
        }, {
                sort: {
                    createdAt: 'desc'
                },
                page: page,
                limit: itemsPerPage
            });

        res.render('schedule/edit', {
            schedule: schedule,
            active: {
                schedule: true
            },
            loadScheduleScripts: true,
            // Pagination below
            archives: archives.docs,
            total: archives.total,
            limit: archives.limit,
            pagination: {
                page: archives.page,
                pageCount: archives.pages,
            }
        });
    } catch (err) {
        req.session.flash = {
            message: 'Något gick fel vid hämtning av schemaläggningen!',
            danger: true
        };
        return res.redirect('/schedules');
    }
};

/**
 * POST /schedules/edit/:id
 */
exports.updateSchedule = async (req, res) => {
    try {
        let httrackSettings = {
            ...req.body,
            ownerId: req.session.user.id
        };
        validateHttrackSettings(httrackSettings);
    } catch (err) {
        console.log(err);
        req.session.flash = {
            message: err.message,
            danger: true
        };
        return res.redirect(`/schedules/edit/${req.params.id}`);
    }

    try {
        await Schedule.findOneAndUpdate({
            _id: req.params.id,
            ownerId: req.session.user.id
        }, {
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
            }).exec();

        req.session.flash = {
            message: 'Schemaläggningen har uppdaterats!',
            success: true
        };
        return res.redirect(`/schedules/edit/${req.params.id}`);
    } catch (err) {

        req.session.flash = {
            message: 'Vi kunde inte uppdatera schemainställningarna!',
            danger: true
        };
        return res.redirect('/schedules');
    }
};

/**
 * DELETE /schedules/delete/:id
 */
exports.deleteSchedule = async (req, res) => {
    try {
        let schedule = await Schedule.findOneAndRemove({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();

        res.status(200).json({
            message: 'Schemaläggningen är raderad.',
            success: true
        });
    } catch (err) {
        // err.code ENOENT = No such file on disk, but entry removed from db.
        let notFound = 'ENOENT';
        // req.session.flash = {
        //     message: 'Kunde inte ta bort schemainställningen!',
        //     danger: true
        // };
        res.status(err.code === notFound ? 404 : 400)
            .json({
                message: 'Kunde inte radera Schemaläggningen.',
                danger: true
            });
    }
};

/*
 * POST /schedule/run/:id
 */
exports.runSchedule = async (req, res) => {
    try {
        let schedule = await Schedule.findOne({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();

        let httrackSettings = {
            ...schedule._doc,
            fromSchedule: schedule._doc._id
        };
        httrackSettings = validateHttrackSettings(httrackSettings);
        httrackWrapper.archive(httrackSettings);

        req.session.flash = {
            message: 'Arkiveringen är startad. Du kommer notifieras via email när arkiveringen är klar.',
            info: true
        };
        res.redirect('/schedules/edit/' + req.params.id)
    } catch (err) {
        console.log(err);
        req.session.flash = {
            message: 'Kunde inte starta arkiveringen!',
            danger: true
        };
        res.redirect('/schedules/edit/' + req.params.id)
    }
};

/*
 * POST /schedule/pause/:id
 */
exports.pauseSchedule = async (req, res) => {
    try {
        let schedule = await Schedule.findOne({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();

        schedule.isPaused = !schedule.isPaused;
        await schedule.save();

        res.json({
            success: true
        });
    } catch (err) {
        res.json({
            success: false,
            message: 'Något gick fel, försök igen senare.'
        });
    }
};