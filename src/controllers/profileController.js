const bcrypt = require('bcrypt');
const User = require('../models/user');
const throwError = require('../utils/error');
const checkPassword = require('../utils/passwordValidator');

/**
 * Validates the password against a set of rules, throws an error if not valid.
 * @param {string} password
 * @param {string} confirmPassword
 */
let validatePassword = async (password, confirmPassword) => {
    let passwordHasError = checkPassword(password, confirmPassword, {
        minimumLength: 6
    });
    if (passwordHasError) {
        throwError(400, passwordHasError.sentence);
    }
};

/**
 * POST /profile
 */
exports.editUser = async (req, res) => {
    const email = req.session.user.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmNewPassword = req.body.confirmNewPassword;
    try {
        let user = await User.findOne({ email: email });
        let result = await bcrypt.compare(oldPassword, user.password);
        if (result === false) throwError(401, 'Gamla lösenordet är fel.');

        await validatePassword(newPassword, confirmNewPassword);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        let updateUser = await User.findOneAndUpdate({ email: email },
            { $set: { password: hashedPassword } },
            { new: true }
        );
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

        return res.redirect('/profile');
    }
};

/**
 * GET /profile
 */
exports.getEditPage = (req, res) => {
    res.render('profile/edit', {
        loadValidation: true,
        active: {
            profile: true
        },
    });
};