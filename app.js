const express = require('express');
const app = express();
const path = require('path');
const request = require('request');
const bodyParser = require('body-parser');
const crypto = require("crypto");
const validUrl = require('valid-url');
const validEmail = require('email-validator');

const baseUrl = 'http://localhost:3500';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.status(200).sendFile(path.join(__dirname + '/public/views/home.htm'));
});

app.post('/url', function(req, res) {
    let url = req.body.url;
    let email = req.body.email;

    if (validUrl.isUri(url) === false) return res.send('Invalid url!');
    if (validEmail.validate(email) === false) return res.send('Invalid email!');

    let id = crypto.randomBytes(10).toString('hex');
    let download = require('./download.js');
    download(url, id, function(error) {
        if (error) {
            console.log(error);
            // return res.status(500).send('Could not archive the desired url.');
        }

        let downloadUrl = baseUrl + '/archives/' + id + '.zip';

        let sendMail = require('./sendMail.js');
        let settings = {
            email: email,
            subject: 'Your download is complete ✔',
            message: '<p><b>Your download of ' + url + ' is complete!</b></p><p><a href="' + downloadUrl + '">Download zip</a></p>'
        }
        sendMail(settings, function(error, info) {
            if (error) {
                console.log(error);
                // return res.status(500).send('Could not send email.');
            }

            console.log('Message sent: %s', info.messageId);
        });
    });
    // request.post('http://localhost:3500/wrapper', {form:{url: url, webhookUrl: webhookUrl, id: id}});
    res.status(200).send('Thank you!<br>We are now downloading ' + url + '<br>When complete we will send email to ' + email + '<br><a href="/">Go back</a>');
});

// app.post('/wrapper', function (req, res) {
//     request.post(baseUrl + '/callback', {form:{url: req.body.url, email: req.body.email, id: '12357'}});
// });

// app.post('/callback/:id', function(req, res) {
//     let id = req.param.id;
//     let url = req.param.zipFile;
//     let downloadUrl = baseUrl + '/archives/' + id + '.zip';

//     let sendMail = require('./sendMail.js');
//     let subject = 'Your download is complete ✔';
//     let html = '<p><b>Your download of ' + url + ' is complete!</b></p><p><a href="' + downloadUrl + '">Download zip</a></p>';
//     sendMail(email, subject, html);
// });

app.get('/archives/:id', function(req, res) {
    let id = req.params.id;
    res.status(200).sendFile(path.join(__dirname + '/' + id));
});

app.listen(3500, function() {
    console.log('Server started :)');
});
