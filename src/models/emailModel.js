var nodemailer = require('nodemailer');

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

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent:', info.messageId);
        }
    });
}

module.exports = { sendMail };
