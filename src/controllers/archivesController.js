const path = require('path');
const fs = require('fs');
const validator = require('../utils/validateHttrackSettings');
const httrackWrapper = require('../models/httrackWrapper');
const EmailModel = require('../models/emailModel');
const Archive = require('../models/archive');
const Schedules = require('../models/schedules');
const Setting = require('../models/enums').setting;

/**
 * POST /archives/
 */
exports.createArchive = async (req, res) => {
    let {
        httrackSettings,
        error
    } = validator.validateHttrackSettings(req.body, req.session.user.id);
    if (error) {
        req.session.flash = error;
        return res.redirect('/'); // return to not continue with archive/saving schedule
    }

    if (!httrackSettings.isScheduled) {
        req.session.flash = {
            message: 'Arkiveringen är startad. Du kommer notifieras via email när arkiveringen är klar.',
            info: true
        };
        res.redirect('/');
    } else {
        req.session.flash = {
            message: 'Arkiveringen är sparad. Du kommer notifieras via email när arkiveringen är klar.',
            info: true
        };
        res.redirect('/');
    }

    if (httrackSettings.isScheduled) {
        if (httrackSettings.typeOfSetting === Setting.STANDARD) {
            Schedules.create({
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
        } else { // advanced settings
            Schedules.create({
                typeOfSetting: httrackSettings.typeOfSetting,
                advancedSetting: httrackSettings.advancedSetting,
                email: httrackSettings.email,
                ownerId: httrackSettings.ownerId,
                typeOfSchedule: httrackSettings.typeOfSchedule
            });
        }
    } else {
        httrackWrapper.archive(httrackSettings, (err, response) => {
            if (err) {
                console.log(err);
                let emailSettings = {
                    email: response.email,
                    subject: 'Din schemalagda arkivering kunde inte slutföras!',
                    message: `<p><b>Din schemalagda arkivering av
                  <a href="${response.url}">${response.url}</a> kunde inte slutföras.</b></p>`
                };

                EmailModel.sendMail(emailSettings);
                return;
            }

            console.log(`Archive ${response.zipFile} was successful!`);

            let archive = new Archive({
                fileName: response.zipFile,
                ownerId: response.ownerId,
                fileSize: response.fileSize
            });
            archive.save();

            let downloadUrl = process.env.SERVER_DOMAIN + `/${process.env.ARCHIVES_FOLDER}/` + response.zipFile;
            let emailSettings = {
                email: response.email,
                subject: 'Arkiveringen är klar ✔',
                message: `<p><b>Din arkivering av
              <a href="${response.url}">${response.url}</a> är klar!</b></p>
              <p><a href="${downloadUrl}">Ladda ned som .zip</a></p>`
            };

            // EmailModel.sendMail(emailSettings);
        });
    }
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

    } catch (err) {
        res.sendStatus(404);
    }
};