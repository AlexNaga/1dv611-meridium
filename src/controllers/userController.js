const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.createUser = (req, res, next) => {
    const email = req.body.email;

    User.find({ email: email })
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Account already exists.',
                    account: email,
                    id: user[0]._id
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
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