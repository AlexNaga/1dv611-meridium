const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../models/user');

function throwError(status, message) {
    let error = new Error(message);
    error.status = status;
    throw error;
}

exports.editUser = async (req, res) => {
    console.log('req body json', JSON.stringify(req.body))

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

        return res.redirect('/profile/edit');
    }
};


exports.getEditPage = (req, res) => {
    if(req.session.user){
        res.render('profile/edit', {
            loadValidation: true,
            profilePageActive: true
        });
    }else{
        res.redirect('/account/login')
    }
};