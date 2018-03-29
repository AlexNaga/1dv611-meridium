var nodemailer = require('nodemailer');

function sendMail(settings, callback) {
    let email = settings.email;
    let subject = settings.subject;
    let message = settings.message;

    var transporter = nodemailer.createTransport({
        host: 'smtp@gmail.com',
        port: 465,
        secure: true,
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: 'kurs1dv611@gmail.com',
        to: email,
        subject: subject,
        html: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        callback(error, info);
    });
}

module.exports = sendMail;