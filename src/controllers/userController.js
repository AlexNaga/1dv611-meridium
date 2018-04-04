const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');

const User = require('../models/user');

exports.createUser = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password[0];

    User.find({ email: email })
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Account already exists.',
                    account: email,
                    id: user[0]._id
                });
            } else {
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: email,
                            password: hash
                        });

                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    message: 'Account successfully created.',
                                    createdAccount: {
                                        _id: result._id,
                                        account: result.user
                                    }
                                });
                            });
                    }
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};


exports.loginUser = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: 'Authentication failed.'
                });
            }

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Authentication failed.'
                    });
                }

                if (result) {
                    const token = jwt.sign(
                        {
                            email: email,
                            userId: user._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: '1h'
                        }
                    );

                    return res.status(200).json({
                        message: 'Authentication is successful.',
                        token: token
                    });
                }

                res.status(401).json({
                    message: 'Authentication failed.'
                });
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
};


exports.getRegisterPage = (req, res, next) => {
    res.status(200).sendFile(path.join(__dirname + '/../../public/register.html'));
};


exports.getLoginPage = (req, res, next) => {
    res.status(200).sendFile(path.join(__dirname + '/../../public/login.html'));
};