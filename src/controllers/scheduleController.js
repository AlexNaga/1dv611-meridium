const Schedule = require('../models/schedules');
const Archive = require('../models/archive');

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
            _id: req.params.id
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
            docs: archives.docs,
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
        await Schedule.findByIdAndUpdate(req.params.id, {
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
        return res.redirect('/schedules');
    } catch (err) {

        req.session.flash = {
            message: 'Vi kunde inte uppdatera schemainställningarna!',
            danger: true
        };
        return res.redirect('/schedules');
    }
};

/**
 * POST/DELETE /schedules/delete/:id
 */
exports.deleteSchedule = async (req, res) => {
    // console.log(req.session)
    try {
        let schedule = await Schedule.findOneAndRemove({ _id: req.params.id }).exec();

        req.session.flash = {
            message: 'Schemaläggningen har tagits bort!',
            success: true
        };

        res.status(200).json({
            deleted: schedule.fileName
        });        
    } catch (err) {
        // err.code ENOENT = No such file on disk, but entry removed from db.
        req.session.flash = {
            message: 'Vi kunde inte ta bort schemainställningen!',
            danger: true
        };
        // return res.redirect('/');
        console.log('renderas ')
    }
};

// POST /schedule/pause/:id
exports.pauseSchedule = async (req, res) => {
    try {
        let schedule = await Schedule.findById(req.params.id).exec();
        schedule.isPaused = !schedule.isPaused;
        await schedule.save();

        res.json({
            success: true
        });
    } catch (error) {
        res.json({
            success: false,
            message: err
        });
    }
}
