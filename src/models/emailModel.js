var nodemailer = require('nodemailer');

/**
 * Needs to have 3 properties: email, subject and message
 * @param {*} settings {email, subject, message}
 */
function sendMail(settings) {
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
        to: settings.email,
        subject: settings.subject,
        html: settings.message
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent:', info.messageId);
        }
    });
}

module.exports = { sendMail };