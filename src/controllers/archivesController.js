const path = require('path');
const fs = require('fs');
const validateHttrackSettings = require('../utils/validateHttrackSettings');
const httrackWrapper = require('../models/httrackWrapper');
const Archive = require('../models/archive');
const Schedules = require('../models/schedules');
const Setting = require('../models/enums').setting;

/**
 * POST /archives/
 */
exports.createArchive = async (req, res) => {
    // Validate httrack settings
    let httrackSettings = '';
    try {
        httrackSettings = validateHttrackSettings({ ...req.body, ...{ ownerId: req.session.user.id } });
    } catch (err) {
        req.session.flash = {
            message: err.message,
            danger: true
        }
        return res.redirect('/');
    }

    // Save schedule in database
    if (httrackSettings.isScheduled) {
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

    req.session.flash = {
        message: `Arkiveringen är startad. Du kommer notifieras via email när arkiveringen är klar.`,
        info: true
    };
    res.redirect('/');

    httrackWrapper.archive(httrackSettings);
};

/**
 * GET /archives/:id
 */
exports.getArchive = (req, res) => {
    let pathToFile = path.join(__dirname + `/../../${process.env.ARCHIVES_FOLDER}/` + req.params.id);

    fs.stat(pathToFile, (err, stat) => {
        if (err == null) {
            // File exist
            return res.status(200).sendFile(pathToFile);
        } else {
            let notFound = 'ENOENT'; // ENOENT === No such file
            res.sendStatus(err.code === notFound ? 404 : 400);
        }
    });
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
        }
        return res.redirect('/');
    }
};

/**
 * DELETE /archives/:id
 */
exports.deleteArchive = async (req, res) => {
    try {
        let archiveName = '';
        const deleteFile = require('util').promisify(fs.unlink);

        let archive = await Archive.findOneAndRemove({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();

        archiveName = archive.fileName;
        await deleteFile(`./${process.env.ARCHIVES_FOLDER}/` + archive.fileName);
        res.status(200).json({
            deleted: archiveName
        });
    } catch (err) {
        let notFound = 'ENOENT'; // ENOENT === No such file
        res.status(err.code === notFound ? 404 : 400)
            .json({
                error: 'No such file'
            });
    }
};

/**
 * GET /archives/preview/:id
 */
exports.previewArchive = async (req, res) => {
    try {
        let archive = await Archive.findOne({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();
        let fileName = archive.fileName.substr(0, archive.fileName.length - 4); // Remove .zip from file-name
        let pathToFile = path.join(__dirname + '/../../previews/' + fileName + '/index.html');

        fs.stat(pathToFile, (err, stat) => {
            if (err == null) {
                // File exist
                return res.status(200).sendFile(pathToFile);
            } else {
                let notFound = 'ENOENT'; // ENOENT === No such file
                res.sendStatus(err.code === notFound ? 404 : 400);
            }
        });

    } catch (error) {
        res.sendStatus(404);
    }
};