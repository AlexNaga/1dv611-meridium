const del = require('delete');
const path = require('path');
const readdir = require('readdir-enhanced');
const validEmail = require('email-validator');
const validUrl = require('valid-url');
const prettyFileSize = require('prettysize');

const httrackWrapper = require('../models/httrackWrapper');
const EmailModel = require('../models/emailModel');
// const Archive = require('../models/archive');

exports.createArchive = (req, res, next) => {
    let url = req.body.url;
    let includeDomains = req.body.includeDomains.replace(/\s+/g, '').split(',');
    let excludePaths = req.body.excludePaths.replace(/\s+/g, '').split(',');
    let robots = req.body.robots;
    let structure = req.body.structure;
    let email = req.body.email;

    if (validUrl.isUri(url) === false) return res.send('Invalid url!');
    if (includeDomains.every(domain => validUrl.isUri(domain)) === false) return res.send('Invalid sub-url!');
    if (req.body.robots > 2 && req.body.robots < 0) return res.send('Invalid robots-settings!');
    if (validEmail.validate(email) === false) return res.send('Invalid email!');

    req.session.flash = { message: 'Arkiveringen är startad. Du kommer notifieras via email när arkiveringen är klar.', info: true };
    res.redirect('/');

    let httrackSettings = {
        url,            // url to crawl
        includeDomains, // including urls
        excludePaths,   // excluding paths
        robots,         // 0 = ignore all metadata and robots.txt. 1 = check all file types without directories. 2 = check all file types including directories.
        structure       // 0 = default site structure.
    };

    console.log('Starting the archiving...');
    // console.log('user', req.session.user);
    httrackWrapper.archive(httrackSettings, (error, response) => {
        if (error) return console.log(error);

        console.log('Archive was successful!');
        // console.log('user', req.session.user);

        // let archive = new Archive({
        //     fileName: response.zipFile,
        //     // owner: req.session.user._id,
        //     fileSize: 1000
        // });
        let downloadUrl = process.env.SERVER_DOMAIN + '/archives/' + response.zipFile;

        let emailSettings = {
            email: email,
            subject: 'Arkiveringen är klar ✔',
            message: `<p><b>Din arkivering av <a href="${url}">${url}</a> är klar!</b></p><p><a href="${downloadUrl}">Ladda ned som .zip</a></p>`
        };

        EmailModel.sendMail(emailSettings, (error, response) => {
            if (error) return console.log(error);
            console.log('Email sent: %s', response.messageId);
        });
    });
};


exports.getArchive = (req, res, next) => {
    let id = req.params.id;
    res.status(200).sendFile(path.join(__dirname + '/../../archives/' + id));
};


exports.listArchives = (req, res, next) => {
    let page = req.query.page || 0;
    let itemsPerPage = 10;

    readdir.async.stat('archives', { filter: '*.zip' })
        .then((files) => {
            res.status(200).json({
                archives: files.sort((a, b) => {
                    // Sort by modification date descending order
                    return b.mtime - a.mtime || b.path - a.path; // mtime = timestamp last modified. path = filename
                }).map(archive => {
                    return {
                        fileName: archive.path,
                        fileSize: prettyFileSize(archive.size)
                    };
                }).slice(page * itemsPerPage, (page + 1) * itemsPerPage) // Take 10
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err
            });
        });
};


exports.deleteArchive = (req, res, next) => {
    let id = req.params.id;

    del.promise(['archives/' + id])
        .then((deleted) => {
            // If something actually was deleted
            if (deleted.length > 0) {
                deleted = deleted[0].split('archives/')[1]; // Only get file name and not the file path
                console.log('Deleted file:', deleted);
            }

            res.status(200).json({
                deleted: deleted
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err
            });
        });
};


exports.previewArchive = (req, res, next) => {
    let id = req.params.id;
    var fs = require('fs');
    var JSZip = require('jszip');

    // read a zip file
    fs.readFile('archives/' + id, function (err, data) {
        if (err) throw err;
        JSZip.loadAsync(data).then(function (zip) {
            let str = zip.file('index.html').async('string')
                .then(result => {
                    res.status(200).json({
                        html: result
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        });
    });
};