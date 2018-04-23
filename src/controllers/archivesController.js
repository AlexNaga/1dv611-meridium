const path = require('path');
const fs = require('fs');
const validator = require('../utils/validator');
const JSZip = require('jszip');

const httrackWrapper = require('../models/httrackWrapper');
const EmailModel = require('../models/emailModel');
const Archive = require('../models/archive');
const ScheduledJobs = require('../models/scheduledJobs');

exports.createArchive = (req, res) => {
    let { httrackSettings, error } = validator.validateHttrackSettings(req.body, req.session.user.id);
    if (error) {
        req.session.flash = error;
        return res.redirect('/'); // return to not continue with archive/saving schedule
    }

    req.session.flash = { message: 'Arkiveringen är startad. Du kommer notifieras via email när arkiveringen är klar.', info: true };
    res.redirect('/');

    if (httrackSettings.isScheduled) {
        if (httrackSettings.typeOfSetting === '0') { // standard settings
            ScheduledJobs.create({
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
            ScheduledJobs.create({
                typeOfSetting: httrackSettings.typeOfSetting,
                advancedSetting: httrackSettings.rawDataInput,
                email: httrackSettings.email,
                ownerId: httrackSettings.ownerId,
                typeOfSchedule: httrackSettings.typeOfSchedule
            });
        }
    } else {
        console.log('Starting the archiving...');
        httrackWrapper.archive(httrackSettings, (error, response) => {
            // TODO : skicka mail med ett bra felmeddelande
            if (error) return console.log(error);

            console.log(`Archive ${response.zipFile} was successful!`);

            let archive = new Archive({
                fileName: response.zipFile,
                ownerId: response.ownerId,
                fileSize: response.fileSize
            });
            archive.save();

            let downloadUrl = process.env.SERVER_DOMAIN + '/archives/' + response.zipFile;
            let emailSettings = {
                email: response.email,
                subject: 'Arkiveringen är klar ✔',
                message: `<p><b>Din arkivering av
              <a href="${response.url}">${response.url}</a> är klar!</b></p>
              <p><a href="${downloadUrl}">Ladda ned som .zip</a></p>`
            };

            EmailModel.sendMail(emailSettings);
        });
    }

};


exports.getArchive = (req, res) => {
    let pathToFile = path.join(__dirname + '/../../archives/' + req.params.id);

    fs.stat(pathToFile, (err, stat) => {
        if (err == null) {
            //Exist
            return res.status(200).sendFile(pathToFile);
        } else {
            // ENOENT = No such file
            res.sendStatus(err.code === 'ENOENT' ? 404 : 400);
            // .json({
            //     error: err
            // });
        }
    });
};


exports.listArchives = (req, res) => {
    let page = req.query.page || 0;
    let itemsPerPage = 10;

    Archive.find({ ownerId: req.session.user.id })
        .sort({ createdAt: 'desc' })
        .skip(page * itemsPerPage)
        .limit(itemsPerPage)
        .then(data => res.json({ archives: data }))
        .catch((err) => {
            res.status(400).json({
                error: err
            });
        });
};


exports.deleteArchive = (req, res) => {
    let id = req.params.id;
    let archiveName = '';
    const deleteFile = require('util').promisify(fs.unlink);

    Archive.findOneAndRemove({ _id: id, ownerId: req.session.user.id }).exec()
        .then((archive) => {
            archiveName = archive.fileName;
            return deleteFile('archives/' + archive.fileName);
        })
        .then(() => {
            res.status(200).json({
                deleted: archiveName
            });
        })
        .catch((err) => {
            // err.code ENOENT = No such file on disk, but removed entry removed from db.
            req.session.flash = {
                message: 'Något gick fel vid radering av arkiv.',
                danger: true
            };

            res.status(err.code === 'ENOENT' ? 404 : 400)
                .json({
                    error: 'No such file'
                });
        });
};


exports.previewArchive = (req, res) => {
    let id = req.params.id;

    Archive.findOne({ _id: id, ownerId: req.session.user.id }).exec()
        .then((doc) => {
            // Read a zip file
            return new Promise((resolve, reject) => {
                fs.readFile('archives/' + doc.fileName, (err, data) => {
                    if (err) reject(err);
                    resolve(data);
                });
            });
        })
        .then((data) => {
            return JSZip.loadAsync(data);
        })
        .then((data) => {
            data.file('index.html').async('string')
                .then(result => {
                    res.status(200).json({
                        html: result
                    });
                })
                .catch(err => {
                    throw err;
                });
        })
        .catch((err) => {
            req.session.flash = {
                message: 'Något gick fel vid hämtning av förhandsgranskning.',
                danger: true
            };

            res.sendStatus(404);
        });
};