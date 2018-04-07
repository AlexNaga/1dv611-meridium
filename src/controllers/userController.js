const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
// const path = require('path');

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

    // User.findOne({ email: email })
    //     .then(user => {
    //         if (user) {
    //             let error = new Error('Account already exists.');
    //             error.status = 409;
    //             throw error;
    //         }

    //         return bcrypt.hash(password, 10);
    //     })
    //     .then(hashedPassword => {
    //         const user = new User({
    //             _id: new mongoose.Types.ObjectId(),
    //             email: email,
    //             password: hashedPassword
    //         });

    //         return user.save();
    //     })
    //     .then(result => {
    //         req.session.user = {
    //             email: email
    //         }

    //         return res.render('account/login', { flash: 'Account successfully created.' });
    //     })
    //     .catch(error => {
    //         return res
    //         .status(error.status || 500)
    //         .render('account/register', { flash: error.message });
    //     });
};

exports.loginUser = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then(user => {
            if (user === null) {
                let error = new Error('Authentication failed.');
                error.status = 401;
                throw error;
            }

            return bcrypt.compare(password, user.password);
        })
        .then(result => {
            if (result === false) {
                let error = new Error('Authentication failed.');
                error.status = 401;
                throw error;
            }

            // const token = jwt.sign(
            //     {
            //         email: email,
            //         userId: user._id
            //     },
            //     process.env.JWT_KEY,
            //     {
            //         expiresIn: '1h'
            //     }
            // );
            req.session.user = {
                email: email
            }

            return res.redirect('/');
        })
        .catch(error => {
            return res
            .status(error.status || 500)
            .render('account/login', { flash: error.message });
        });
};

exports.logoutUser = (req, res, next) => {
    req.session = null;
    res.redirect('/');
};

exports.getRegisterPage = (req, res, next) => {
    res.render('account/register');
};

exports.getLoginPage = (req, res, next) => {
    res.render('account/login');
};