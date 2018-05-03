const bcrypt = require('bcrypt');
const User = require('../models/user');
const throwError = require('../utils/error');

/**
 * POST /profile/edit
 */
exports.editUser = async (req, res) => {
    const email = req.session.user.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateParams = {
            password: hashedPassword
        };

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
    } catch (err) {
        req.session.flash = {
            message: err.message,
            danger: true
        };

        return res.redirect('/profile/edit');
    }
};

/**
 * GET /profile/edit
 */
exports.getEditPage = (req, res) => {
    res.render('profile/edit', {
        loadValidation: true,
        active: {
            profile: true
        },
    });
};