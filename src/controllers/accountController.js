const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const User = require('../models/user');
const EmailModel = require('../models/emailModel');

function throwError(status, message) {
    let error = new Error(message);
    error.status = status;
    throw error;
}

exports.createUser = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password[0];
    const confirmPassword = req.body.password[1];

    try {
        if(password !== confirmPassword) throwError(400, 'Lösenorden stämmer inte överrens.')
        let user = await User.findOne({
            email: email
        });
        if (user) throwError(409, 'Kontot existerar redan.');

        let hashedPassword = await bcrypt.hash(password, 10);
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

        return res.redirect('/account/register');
    }
};

exports.loginUser = async (req, res) => {
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

        return res.redirect('/account/login');
    }
};

exports.resetPassword = async (req, res) => {
    const email = req.body.email;
    let user = await User.findOne({
        email: email
    });

    let tempCode = crypto.randomBytes(20).toString('hex');

    const link = process.env.HOSTNAME || process.env.SERVER_DOMAIN;
    let resetLink = link + '/account/reset-password/' + tempCode;
    console.log(resetLink);
    console.log(link);
    console.log(tempCode);
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
                message: `Återställ ditt lösenord <a href="${resetLink}">här</a>`
            }
            EmailModel.sendMail(emailSettings);
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

exports.validateLink = async (req, res) => {
    let code = req.params.temporaryCode;
    console.log(code);
    if (await isValidCode(code)) {
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

disableCode = async (code) => {
    console.log('COOOODDDDEEEEEE' + code);
    let updatedCode = {
        code: null
    }

    let user = await User.findOneAndUpdate({code: code}, {$set: updatedCode}, {new: true});
    console.log(code);
}

exports.updatePassword = async (req, res) => {
    const code = req.params.temporaryCode;
    console.log(req.body);

    if (await !isValidCode(code)) {
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
        await disableCode(code);

            console.log('code:' + code);
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
        loadValidation: true
    });
};

exports.getLoginPage = (req, res) => {
    res.render('account/login');
};

exports.getPasswordResetPage = (req, res) => {
    res.render('account/forgot-password', {
        loadValidation: true
    });
};