const path = require('path');
const fs = require('fs');
const validateHttrackSettings = require('../utils/validateHttrackSettings');
const httrackWrapper = require('../models/httrackWrapper');
const Archive = require('../models/archive');
const Schedules = require('../models/schedules');
const Setting = require('../models/enums').setting;
const throwError = require('../utils/error');

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
        }
        return res.redirect('/');
    }

    // action = name of buttons. 0 = Arkivera, 1 = Spara
    let action = parseInt(req.body.action);
    if (action !== 0 && action !== 1) {
        req.session.flash = {
            message: 'Falaktig metod, välj arkivera eller spara.',
            danger: true
        }
        return res.redirect('/');
    }

    // if pressed 'Spara' -> save schedule in database
    // TODO enums
    if (action === 1) {
        try {
            if (httrackSettings.typeOfSetting === Setting.STANDARD) {
                let schedule = new Schedules({
                    typeOfSetting: httrackSettings.typeOfSetting,
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
            } else if (httrackSettings.typeOfSetting === Setting.ADVANCED) {
                let schedule = new Schedules({
                    typeOfSetting: httrackSettings.typeOfSetting,
                    advancedSetting: httrackSettings.advancedSetting,
                    email: httrackSettings.email,
                    ownerId: httrackSettings.ownerId,
                    typeOfSchedule: httrackSettings.typeOfSchedule
                });
                await schedule.save();
            }

            req.session.flash = {
                message: 'Schemaläggningen har sparats.',
                success: true
            };
            return res.redirect('/');
        } catch (err) {
            console.log(err);
            req.session.flash = {
                message: 'Schemaläggningen kunde inte sparas.',
                danger: true
            };
            return res.redirect('/');
        }
    }

    // if pressed 'Arkivera' -> make archive
    if (action === 0) {
        req.session.flash = {
            message: `Arkiveringen är startad. Du kommer notifieras via email när arkiveringen är klar.`,
            info: true
        };
        res.redirect('/');

        httrackWrapper.archive(httrackSettings);
    }

    // this part of code should be unreachable
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
 * GET /archives/
 */
exports.listArchives = async (req, res) => {
    try {
        let page = req.query.p || 1;
        let itemsPerPage = 10;

        let archives = await Archive.paginate({
            ownerId: req.session.user.id
        }, {
                sort: {
                    createdAt: 'desc'
                },
                page: page,
                limit: itemsPerPage
            });

        res.render('archive/index', {
            active: {
                archive: true
            },
            loadArchiveScripts: true,

            archives: archives.docs,
            total: archives.total,
            limit: archives.limit,
            pagination: {
                page: archives.page,
                pageCount: archives.pages
            }
        });
    } catch (err) {
        console.log(err);
        req.session.flash = {
            message: 'Kunde inte lista dina arkiveringar!',
            danger: true
        };
        return res.redirect('/');
    }
};

/**
 * DELETE /archives/:id
 */
exports.deleteArchive = async (req, res) => {
    let archiveName;
    try {
        let archive = await Archive.findOneAndRemove({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();

        archiveName = archive.fileName;
        const deleteFile = require('util').promisify(fs.unlink);
        await deleteFile(`./${process.env.ARCHIVES_FOLDER}/` + archiveName);

        res.status(200).json({
            message: 'Arkiveringen är raderad.',
            success: true
        });
    } catch (err) {
        // ENOENT === No such file or directory
        if (err.code != 'ENOENT') {
            res.status(400)
                .json({
                    message: 'Kunde inte radera arkiveringen.',
                    danger: true
                });
        }
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

        let pathToFolder = path.join(__dirname + '/../../previews/' + archive.id);
        fs.stat(pathToFolder, (err, stat) => {
            if (err) return res.sendStatus(err.code === 'ENOENT' ? 404 : 400); // ENOENT === No such file

            // Folder exist, continue to static folder and let express find folder with the id as name.
            next();
        });
    } catch (err) {
        res.sendStatus(err.code === 'ENOENT' ? 404 : 400); // ENOENT === No such file
    }
};