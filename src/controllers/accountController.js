const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const checkPassword = require('../utils/passwordValidator');

const User = require('../models/user');
const EmailModel = require('../models/emailModel');

function throwError(status, message) {
    let error = new Error(message);
    error.status = status;
    throw error;
}

validatePassword = async (password, confirmPassword) => {
    let passwordHasError = checkPassword(password, confirmPassword, {
        minimumLength: 6
    })
    if (passwordHasError) {
        throwError(400, passwordHasError.sentence)
    }
}

exports.createUser = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password[0];
    const confirmPassword = req.body.password[1];

    try {
        let user = await User.findOne({ email: email });
        if (user) throwError(409, 'Kontot existerar redan.');

        await validatePassword(password, confirmPassword);

        const hashedPassword = await bcrypt.hash(password, 10);
        let newUser = new User({
            email: email,
            password: hashedPassword
        });
        await newUser.save();

        req.session.user = {
            email: email,
            id: newUser._id
        };
        req.session.flash = {
            message: 'Kontot har skapats.',
            success: true
        };

        return res.redirect('/');
    } catch (error) {
        req.session.flash = {
            message: error.message,
            danger: true
        };

        return res.render('account/register', {
            loadValidation: true,
            registerPageActive: true,
            email
        });
    }
};

exports.loginUser = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        let user = await User.findOne({ email: email }).exec();
        if (user === false) throwError(401, 'Felaktiga inloggningsuppgifter.');

        let result = await bcrypt.compare(password, user.password);
        if (result === false) throwError(401, 'Felaktiga inloggningsuppgifter.');

        req.session.user = {
            email: email,
            id: user._id
        };
        req.session.flash = {
            message: `Välkommen, ${email}`,
            success: true
        };

        return res.redirect('/');
    } catch (error) {
        req.session.flash = {
            message: error.message,
            danger: true
        };

        return res.render('account/login', {
            loginPageActive: true,
            email
        });
    }
};

exports.resetPassword = async (req, res) => {
    const email = req.body.email;
    let user = await User.findOne({ email: email }).exec();
    if (user) {
        let tempCode = crypto.randomBytes(20).toString('hex');

        const link = process.env.HOSTNAME || process.env.SERVER_DOMAIN;
        let resetLink = link + '/account/reset-password/' + tempCode;
        let duration = 60 * 60 * 2; // seconds = 2 hours
        let tempValue = {
            resetPasswordCode: tempCode,
            resetPasswordDate: Date.now() / 1000 + duration
        };

        try {
            if (user) {
                await User.findOneAndUpdate({ email: email }, { $set: tempValue }).exec();

                let emailSettings = {
                    email: email,
                    subject: 'Återställ ditt lösenord',
                    message: `<p>Hej,</p>
                          <p>Du har fått detta e-postmeddelande eftersom du har begärt ett nytt lösenord för ditt konto på Arkivdium.</p>
                          <a href="${resetLink}">Klicka på denna länk för att skapa ditt nya lösenord</a>
                          <p>Med vänliga hälsningar,<br>Vi på Arkivdium</p>`
                }

                EmailModel.sendMail(emailSettings);
                req.session.flash = {
                    message: 'Om den angivna e-postadressen finns i vårt system så har vi nu skickat en återställningslänk till den.',
                    info: true
                };
                res.redirect('/');
            }
        } catch (error) {
            req.session.flash = {
                message: error.message,
                danger: true
            };
            return res.redirect('/account/login');
        }
    } else {
        let emailSettings = {
            email: email,
            subject: 'Återställning av lösenord',
            message: `Någon har försökt återställa ett lösenord till den här e-posten men vi har den inte registrerad hos oss på Arkivdium.se.`
        }

        EmailModel.sendMail(emailSettings);
        req.session.flash = {
            message: 'Om den angivna e-postadressen finns i vårt system så har vi nu skickat en återställningslänk till den.',
            info: true
        };
        res.redirect('/');
    }
};

exports.validateLink = async (req, res) => {
    if (await isValidCode(req.params.temporaryCode)) {
        return res.render('account/update-password', {
            loadValidation: true
        });
    };
    req.session.flash = {
        message: 'Länken har utgått!',
        danger: true
    };
    return res.redirect('/');
};

isValidCode = async (code) => {
    let user = await User.findOne({ resetPasswordCode: code }).exec();

    if (user) {
        if (Date.now() / 1000 < user.resetPasswordDate) {
            return true;
        }
    }
    return false;
}

disableCode = async (code) => {
    await User.findOneAndUpdate({ resetPasswordCode: code }, { $set: { resetPasswordCode: null } }).exec();
}

exports.updatePassword = async (req, res) => {
    const code = req.params.temporaryCode;

    if (await !isValidCode(code)) {
        req.session.flash = {
            message: 'Länken har utgått!',
            danger: true
        };
        return res.redirect('/');
    }
    const password = req.body.resetPassword;
    const confirmPassword = req.body.confirmPassword;
    await validatePassword(password, confirmPassword);

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await User.findOneAndUpdate({ resetPasswordCode: code }, { $set: { password: hashedPassword } }).exec();
        await disableCode(code);

        req.session.flash = {
            message: 'Lösenordet har uppdaterats!',
            success: true
        };
        return res.redirect('/');
    } catch (error) {
        console.log(error);
        req.session.flash = {
            message: error.message,
            danger: true
        };
        return res.redirect('/account/reset-password/' + code);
    }
};

exports.logoutUser = (req, res) => {
    req.session.user = null;
    req.session.flash = {
        message: 'Du har blivit utloggad.',
        info: true
    };
    res.redirect('/');
};

exports.getRegisterPage = (req, res) => {
    res.render('account/register', {
        loadValidation: true,
        registerPageActive: true
    });
};

exports.getLoginPage = (req, res) => {
    res.render('account/login', { loginPageActive: true });
};

exports.getPasswordResetPage = (req, res) => {
    res.render('account/forgot-password', {
        loadValidation: true
    });
};