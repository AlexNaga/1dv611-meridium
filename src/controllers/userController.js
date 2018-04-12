const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../models/user');
const EmailModel = require('../models/emailModel');
const generator = require('generate-password');

function throwError(status, message) {
    let error = new Error(message);
    error.status = status;
    throw error;
}

exports.createUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password[0];

    try {
        let user = await User.findOne({
            email: email
        });
        if (user) throwError(409, 'Kontot existerar.');

        let hashedPassword = await bcrypt.hash(password, 10);
        let newUser = new User({
            email: email,
            password: hashedPassword
        });
        await newUser.save();

        req.session.user = {
            email: email
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

        return res.redirect('/');
    }
};

exports.loginUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        let user = await User.findOne({
            email: email
        });
        if (user === false) throwError(401, 'Felaktiga inloggningsuppgifter.');

        let result = await bcrypt.compare(password, user.password);
        if (result === false) throwError(401, 'Felaktiga inloggningsuppgifter.');

        req.session.user = {
            email: email
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

        return res.redirect('/account/login');
    }
};

exports.editUser = async (req, res, next) => {
    const email = req.session.user.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateParams = {
        password: hashedPassword
    };

    try {
        let user = await User.findOne({
            email: email
        });
        let result = await bcrypt.compare(oldPassword, user.password);
        if (result === false) throwError(401, 'Fel lösenord.');

        let updateUser = await User.findOneAndUpdate({
            email: email
        }, {
            $set: updateParams
        }, {
            new: true
        });
        await updateUser.save();

        req.session.flash = {
            message: 'Lösenordet har uppdaterats!',
            success: true
        };

        return res.redirect('/');
    } catch (error) {
        req.session.flash = {
            message: error.message,
            danger: true
        };

        return res.redirect('/account/edit');
    }
};

exports.resetPassword = async (req, res, next) => {
    const email = req.body.email;
    let user = await User.findOne({
        email: email
    });

    let tempCode = generator.generate({
        length: 21,
        numbers: true
    });


    const link = process.env.HOSTNAME;
    let resetLink = link + '/account/reset-password/' + tempCode;
    let tempValue = {
        code: tempCode,
        date: Date.now() / 1000
    };

    try {
        if (user) {
            let userTempCode = await User.findOneAndUpdate({
                email: email
            }, {
                $set: tempValue
            }, {
                new: true
            });
            await userTempCode.save();

            let emailSettings = {
                email: email,
                subject: 'Förfrågan om återställning av lösenord',
                message: `Återställ ditt lösenord <a href=${resetLink}>här</a>`
            }
            EmailModel.sendMail(emailSettings, (error, response) => {
                if (error) return console.log(error);
                console.log('Mail sent: %s', response.messageId);
            });
            req.session.flash = {
                message: 'Återställningslänk skickad.',
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
};

exports.validateLink = async (req, res, next) => {
    let code = req.params.temporaryCode;
    console.log(code);
    if(await isValidCode(code)) {
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
    let user = await User.findOne({
        code: code
    });
    if (user) {
        if (Date.now() / 1000 - 7200 < user.date) {
            return true;
        }
    }
    return false;
}

exports.updatePassword = async (req, res, next) => {
    const code = req.params.temporaryCode;
    console.log(req.body);

    if(await !isValidCode(code)) {
        req.session.flash = {
            message: 'Länken har utgått!',
            danger: true
        };
        return res.redirect('/');
    }
    const newPassword = req.body.resetPassword;
    const newPasswordConfirm = req.body.confirmPassword;
    const hashedPassword = await bcrypt.hash(newPasswordConfirm, 10);

    const updateParams = {
        password: hashedPassword
    };

    try {
        let updateUser = await User.findOneAndUpdate({
            code: code
        }, {
            $set: updateParams
        }, {
            new: true
        });
        await updateUser.save();

        req.session.flash = {
            message: 'Lösenordet har uppdaterats!',
            success: true
        };
        return res.redirect('/');
    } catch (error) {
        req.session.flash = {
            message: error.message,
            danger: true
        };
        return res.redirect('/account/reset-password/' + code);
    }
};

exports.logoutUser = (req, res, next) => {
    req.session.user = null;
    req.session.flash = {
        message: 'Du har blivit utloggad.',
        info: true
    };
    res.redirect('/');
};

exports.getRegisterPage = (req, res, next) => {
    res.render('account/register', {
        loadValidation: true
    });
};

exports.getLoginPage = (req, res, next) => {
    res.render('account/login');
};

exports.getEditPage = (req, res, next) => {
    res.render('account/profile', {
        loadValidation: true
    });
};

exports.getPasswordResetPage = (req, res, next) => {
    res.render('account/forgot-password', {
        loadValidation: true
    });
};