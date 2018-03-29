var express = require('express');
var router = express.Router();
const crypto = require("crypto");
const validEmail = require('email-validator');
const validUrl = require('valid-url');

const baseUrl = 'http://localhost:3000';

router.post('/', function (req, res, next) {
    let url = req.body.url;
    let email = req.body.email;

    if (validUrl.isUri(url) === false) return res.send('Invalid url!');
    if (validEmail.validate(email) === false) return res.send('Invalid email!');

    let id = crypto.randomBytes(10).toString('hex');
    let download = require('../src/archive');

    download(id, url, function (error) {
        if (error) {
            return console.log(error);
        }

        let downloadUrl = baseUrl + '/archives/' + id + '.zip';

        let sendMail = require('../src/sendMail');
        let settings = {
            email: email,
            subject: 'Your download is complete ✔',
            message: '<p><b>Your download of ' + url + ' is complete!</b></p><p><a href="' + downloadUrl + '">Download zip</a></p>'
        }
        sendMail(settings, function (error, info) {
            if (error) {
                return console.log(error);
            }

            console.log('Message sent: %s', info.messageId);
        });
    });

    res.status(200).send('Thank you!<br>We are now downloading ' + url + '<br>When complete we will send email to ' + email + '<br><a href="/">Go back</a>');
});

module.exports = router;