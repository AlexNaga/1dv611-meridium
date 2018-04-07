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

        // return res.status(200).render('account/login', { flash: 'Account successfully created.' });
        return res.redirect('/');
    }
    catch (error) {
        return res.status(error.status || 500).render('account/register', { flash: error.message });
    }
};

exports.loginUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        let user = await User.findOne({ email: email });
        if (user === null) throwError(401, 'Could not find a user with that email.');

        let result = await bcrypt.compare(password, user.password);
        if (result === false) throwError(401, 'Wrong password.');

        req.session.user = { email: email };
        res.locals.user = req.session.user;

        // return res.status(200).render('home', { flash: 'Welcome!' });
        return res.redirect('/');
    }
    catch (error) {
        return res.status(error.status || 500).render('account/login', { flash: error.message });
    }
};

exports.logoutUser = (req, res, next) => {
    req.session = null;
    res.locals.user = null;
    res.status(200).render('home', { flash: 'You have logged out.' });
    // res.redirect('/');
};

exports.getRegisterPage = (req, res, next) => {
    res.render('account/register');
};

exports.getLoginPage = (req, res, next) => {
    res.render('account/login');
};