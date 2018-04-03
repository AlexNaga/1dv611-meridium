const del = require('delete');
const path = require('path');
const readdir = require('readdir-enhanced');
const validEmail = require('email-validator');
const validUrl = require('valid-url');

const httrackWrapper = require('../models/httrackWrapper');
const emailModel = require('../models/emailModel');

exports.createArchive = (req, res, next) => {
    let url = req.body.url;
    let email = req.body.email;

    if (validUrl.isUri(url) === false) return res.send('Invalid url!');
    if (validEmail.validate(email) === false) return res.send('Invalid email!');

    res.status(200).sendFile(path.join(__dirname + '/../../public/success.html'));

    httrackWrapper.archive(url, (error, response) => {
        if (error) return console.log(error);

        let downloadUrl = process.env.SERVER_DOMAIN + '/' + response.zipArchivePath;

        let emailSettings = {
            email: email,
            subject: 'Your archive is ready ✔',
            message: `<p><b>Your archive of ${url} is complete!</b></p><p><a href="${downloadUrl}">Download .zip</a></p>`
        }
        emailModel.sendMail(emailSettings, (error, response) => {
            if (error) return console.log(error);

            console.log('Message sent: %s', response.messageId);
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

    readdir.async.stat('archives')
        // readdir.async('archives')
        .then((files) => {
            res.status(200).json({
                // Varför returnerar vi ett objekt med en array i och inte bara en array direkt?
                archives: files.sort((a, b) => {
                    // Sort by modification date descending order
                    return b.mtime - a.mtime;
                }).map(archive => {
                    return archive;
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
            // If file really deleted
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