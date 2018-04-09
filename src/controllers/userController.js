const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../models/user');

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
        if (user) throwError(409, 'Account already exists.');

        let hashedPassword = await bcrypt.hash(password, 10);
        let newUser = new User({ email: email, password: hashedPassword });
        await newUser.save();

        req.session.user = { email: email };
        req.session.flash = { message: 'Account successfully created.', success: true };

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
        if (user === false) throwError(401, 'Wrong email or password.');

        let result = await bcrypt.compare(password, user.password);
        if (result === false) throwError(401, 'Wrong email or password.');

        req.session.user = { email: email };
        req.session.flash = { message: 'Welcome!', success: true };

        return res.redirect('/');
    }
    catch (error) {
        req.session.flash = { message: error.message, danger: true };

        return res.redirect('/');
    }
};

exports.logoutUser = (req, res, next) => {
    req.session.user = null;
    req.session.flash = { message: 'You have logged out.', info: true };
    res.redirect('/');
};

exports.getRegisterPage = (req, res, next) => {
    res.render('account/register');
};

exports.getLoginPage = (req, res, next) => {
    res.render('account/login');
};