const crypto = require("crypto");
const download = require('../archive');
const moment = require('moment');
const path = require('path');
const sendMail = require('../sendMail');
const validEmail = require('email-validator');
const validUrl = require('valid-url');
const { URL } = require('url');

exports.createArchive = (req, res, next) => {
    let url = req.body.url;
    let email = req.body.email;

    if (validUrl.isUri(url) === false) return res.send('Invalid url!');
    if (validEmail.validate(email) === false) return res.send('Invalid email!');

    let randomInt = Math.floor(Math.random() * 99);
    let timeStamp = moment().format('YYYY-MM-DD_HH:mm:ss_') + randomInt; // 2018-03-29_22:29:21_42

    download(timeStamp, url, (error) => {
        if (error) {
            return console.log(error);
        }

        let hostname = new URL(url).hostname;
        let downloadUrl = process.env.SERVER_DOMAIN + `/archives/${hostname}_${timeStamp}.zip`;

        console.log(downloadUrl);


        let settings = {
            email: email,
            subject: 'Your archive is ready ✔',
            message: `<p><b>Your archive of ${url} is complete!</b></p><p><a href="${downloadUrl}">Download .zip</a></p>`
        }
        sendMail(settings, (error, info) => {
            if (error) {
                return console.log(error);
            }

            console.log('Message sent: %s', info.messageId);
        });
    });

    res.status(200).send('Thank you!<br>We are now downloading ' + url + '<br>When complete we will send email to ' + email + '<br><a href="/">Go back</a>');
};

exports.getArchive = (req, res, next) => {
    let id = req.params.id;
    res.status(200).sendFile(path.join(__dirname + '/../archives/' + id));
};