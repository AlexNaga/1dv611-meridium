const path = require('path');
const fs = require('fs');
const validEmail = require('email-validator');
const validUrl = require('valid-url');
const JSZip = require('jszip');

const httrackWrapper = require('../models/httrackWrapper');
const EmailModel = require('../models/emailModel');
const Archive = require('../models/archive');

exports.createArchive = (req, res) => {
    let url = req.body.url;
    let includeDomains = req.body.includeDomains === undefined ? [] : req.body.includeDomains.replace(' ', '').split(',');
    let excludePaths = req.body.excludePaths === undefined ? [] : req.body.excludePaths.replace(' ', '').split(',');
    let robots = req.body.robots;
    let structure = req.body.structure;
    let email = req.body.email;
    let ownerId = req.session.user.id;
    let isSave = (req.body.action === '1'); // action = name of buttons. 0 = Arkivera, 1 = Spara

    if (url === undefined || validUrl.isUri(url) === false) {
        req.session.flash = { message: 'Fel url!', danger: true };
        return res.redirect('/');
    }
    if (includeDomains[0] !== '' && includeDomains.every(domain => validUrl.isUri(domain)) === false) {
        req.session.flash = { message: 'Fel sub-url!', danger: true };
        return res.redirect('/');
    }
    if (req.body.robots > 2 && req.body.robots < 0) {
        req.session.flash = { message: 'Fel robot-inställningar!', danger: true };
        return res.redirect('/');
    }
    if (validEmail.validate(email) === false) {
        req.session.flash = { message: 'Fel epost!', danger: true };
        return res.redirect('/');
    }

    req.session.flash = { message: 'Arkiveringen är startad. Du kommer notifieras via email när arkiveringen är klar.', info: true };
    res.redirect('/');

    let httrackSettings = {
        url,            // url to crawl
        includeDomains, // including urls
        excludePaths,   // excluding paths
        robots,         // 0 = ignore all metadata and robots.txt. 1 = check all file types without directories. 2 = check all file types including directories.
        structure,      // 0 = default site structure.
        ownerId,        // pass along to response
        email           // pass along to response
    };

    if (isSave) {
        console.log('TODO: Spara till databasen');

    } else {
        console.log('Starting the archiving...');
        httrackWrapper.archive(httrackSettings, (error, response) => {
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
            // read a zip file
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
            res.sendStatus(404);
        });
};