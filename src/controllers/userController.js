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
        let user = await User.findOne({ email: email });
        if (user) throwError(409, 'Kontot existerar.');

        let hashedPassword = await bcrypt.hash(password, 10);
        let newUser = new User({ email: email, password: hashedPassword });
        await newUser.save();

        req.session.user = { email: email };
        req.session.flash = { message: 'Kontot har skapats.', success: true };

        return res.redirect('/');
    }
    catch (error) {
        req.session.flash = { message: error.message, danger: true };

        return res.redirect('/');
    }
};

exports.loginUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        let user = await User.findOne({ email: email });
        if (user === false) throwError(401, 'Felaktiga inloggningsuppgifter.');

        let result = await bcrypt.compare(password, user.password);
        if (result === false) throwError(401, 'Felaktiga inloggningsuppgifter.');

        req.session.user = { email: email };
        req.session.flash = { message: `Välkommen, ${email}`, success: true };

        return res.redirect('/');
    }
    catch (error) {
        req.session.flash = { message: error.message, danger: true };

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
        let user = await User.findOne({ email: email });
        let result = await bcrypt.compare(oldPassword, user.password);
        if (result === false) throwError(401, 'Fel lösenord.');

        let updateUser = await User.findOneAndUpdate({ email: email }, { $set: updateParams }, { new: true });
        await updateUser.save();

        req.session.flash = { message: 'Lösenordet har uppdaterats!', success: true };

        return res.redirect('/');
    }
    catch (error) {
        req.session.flash = { message: error.message, danger: true };

        return res.redirect('/account/edit');
    }
};

exports.resetPassword = (req, res, next) => {
    const email = req.body.email;
    var tempPassword = generator.generate({
        length: 10,
        numbers: true
    });

    let updateUserPassword = await User.findOneAndUpdate({ email: email }, { $set: tempPassword }, { new: true });
    await updateUserPassword.save();

    let emailSettings = {
        email: email,
        subject: 'Återställning av lösenord.',
        message: `<p><b>Ditt tillfälliga lösenord: ${tempPassword}</b></p>` + 'För att ändra ditt lösenord, klicka här: http://localhost:3000/acount/edit'
    };

    console.log('Sending user password reset mail...');
    EmailModel.sendMail(emailSettings, (error, response) => {
        if (error) return console.log(error);
        console.log('Mail sent: %s', response.messageId);
    });

    req.session.flash = { message: 'Återställningslänk skickad.', info: true };
    res.redirect('/');
}; 

exports.logoutUser = (req, res, next) => {
    req.session.user = null;
    req.session.flash = { message: 'Du har blivit utloggad.', info: true };
    res.redirect('/');
};


exports.getRegisterPage = (req, res, next) => {
    res.render('account/register', { loadValidation: true });
};

exports.getLoginPage = (req, res, next) => {
    res.render('account/login');
};

exports.getEditPage = (req, res, next) => {
    res.render('account/profile', { loadValidation: true });
};

exports.getPasswordResetPage = (req, res, next) => {
    res.render('account/password_reset', { loadValidation: true });
};