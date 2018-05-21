const path = require('path');
const fs = require('fs-extra');
const validateHttrackSettings = require('../utils/validateHttrackSettings');
const httrackWrapper = require('../models/httrackWrapper');
const Archive = require('../models/archive');
const Schedules = require('../models/schedules');
const Setting = require('../models/enums').setting;
const throwError = require('../utils/error');


/**
 * GET /archives/
 */

exports.listSchedule = async (req, res) => {
    try {
        let page = req.query.p || 1;
        let itemsPerPage = 10;
        let schedule = await Schedules.paginate({
            ownerId: req.session.user.id
        }, {
                sort: {
                    createdAt: 'desc'
                },
                page: page,
                limit: itemsPerPage
            });

        res.render('archives/index', {
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
 * GET /archives/edit/:id
 */
exports.getSchedule = async (req, res) => {
    try {
        let page = req.query.p || 1;
        let itemsPerPage = 10;

        let schedule = await Schedules.findOne({
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

        res.render('archives/edit', {
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
        return res.redirect('/archives');
    }
};

/**
 * POST /archives/edit/:id
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
        return res.redirect(`/archives/edit/${req.params.id}`);
    }

    try {
        await Schedules.findOneAndUpdate({
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
                    shouldNotify: req.body.shouldNotify === 'on' // checked = 'on', else shouldNotify is omitted
                }
            }).exec();
        req.session.flash = {
            message: 'Schemaläggningen har uppdaterats!',
            success: true
        };
        return res.redirect(`/archives/edit/${req.params.id}`);
    } catch (err) {

        req.session.flash = {
            message: 'Vi kunde inte uppdatera schemainställningarna!',
            danger: true
        };
        return res.redirect('/archives');
    }
};



/**
 * POST /archives/
 */
exports.createArchive = async (req, res) => {
    // Validate httrack settings
    let httrackSettings = {
        ...req.body,
        ownerId: req.session.user.id
    };
    try {
        httrackSettings = validateHttrackSettings(httrackSettings);
    } catch (err) {
        console.log(err);
        req.session.flash = {
            message: err.message,
            danger: true
        };
        return res.redirect('/archive');
    }

    try {
        // Create the schedule
        let schedule = new Schedules({
            typeOfSetting: httrackSettings.typeOfSetting,
            advancedSetting: httrackSettings.advancedSetting,
            url: httrackSettings.url,
            includeDomains: httrackSettings.includeDomains,
            excludePaths: httrackSettings.excludePaths,
            robots: httrackSettings.robots,
            structure: httrackSettings.structure,
            email: httrackSettings.email,
            ownerId: httrackSettings.ownerId,
            typeOfSchedule: httrackSettings.typeOfSchedule
        });

        await schedule.save();
        req.session.flash = {
            message: 'Arkiveringen är startad. Du kommer notifieras via e-post när arkiveringen är klar.',
            info: true
        };

        res.redirect('/archive');

        // Create the archive
        httrackWrapper.archive({
            ...httrackSettings,
            fromSchedule: schedule.id
        });
    } catch (err) {
        console.log(err);
        req.session.flash = {
            message: 'Arkiveringen kunde inte sparas.',
            danger: true
        };
        return res.redirect('/archive');
    }
};

/**
 * GET /archives/:id
 */
exports.downloadArchive = async (req, res) => {
    try {
        let archive = await Archive.findOne({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();

        let pathToFile = path.join(process.cwd() + `/${process.env.ARCHIVES_FOLDER}/` + archive.fileName);

        if (fs.existsSync(pathToFile)) {
            return res.download(pathToFile, archive.fileName);
        } else {
            throwError(404, 'Arkivet finns inte längre kvar.');
        }
    } catch (err) {
        res.sendStatus(err.status || 400).end();
    }
};

/**
 * DELETE /archives/:id
 */
exports.deleteArchive = async (req, res) => {
    try {
        let archive = await Archive.findOneAndRemove({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();

        const deleteFolder = require('util').promisify(fs.remove);
        const deleteFile = require('util').promisify(fs.unlink);
        await deleteFolder(`./${process.env.PREVIEWS_FOLDER}/${archive.id}`);
        await deleteFile(`./${process.env.ARCHIVES_FOLDER}/${archive.fileName}`);

    } catch (err) {
        // TODO : Logga ev fel?
        // console.log(err);
        // ENOENT === No such file or directory
        // if (err.code !== 'ENOENT') {
        // res.status(400)
        //     .json({
        //         message: 'Kunde inte radera arkiveringen.',
        //         danger: true
        //     });
        // }
    } finally {
        res.status(200).json({
            message: 'Arkiveringen har raderats.',
            success: true
        });
    }
};

/**
 * GET /archives/preview/:id
 */
exports.previewArchive = async (req, res, next) => {
    try {
        let archive = await Archive.findOne({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();

        let pathToFolder = path.join(__dirname + `/../../${process.env.PREVIEWS_FOLDER}/` + archive.id);
        fs.stat(pathToFolder, (err, stat) => {
            if (err) return res.sendStatus(err.code === 'ENOENT' ? 404 : 400); // ENOENT === No such file

            // Folder exist. Continue to static folder and let express find the folder with id as folder name
            next();
        });
    } catch (err) {
        res.sendStatus(err.code === 'ENOENT' ? 404 : 400); // ENOENT === No such file
    }
};