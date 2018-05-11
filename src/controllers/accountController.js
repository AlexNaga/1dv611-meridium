const bcrypt = require('bcrypt');
const crypto = require('crypto');
const checkPassword = require('../utils/passwordValidator');

const User = require('../models/user');
const EmailModel = require('../models/emailModel');
const throwError = require('../utils/error');

/**
 * Validates the password against a set of rules, throws an error if not valid.
 * @param {string} password
 * @param {string} confirmPassword
 */
let validatePassword = async (password, confirmPassword) => {
    let passwordHasError = checkPassword(password, confirmPassword, { minimumLength: 6 });
    if (passwordHasError) {
        throwError(400, passwordHasError.sentence);
    }
};

/**
 * Checks if the temporary reset-password code is valid
 * @param {string} code
 */
let isValidCode = async (code) => {
    let user = await User.findOne({ resetPasswordCode: code }).exec();

    if (user) {
        if (Date.now() / 1000 < user.resetPasswordDate) {
            return true;
        }
    }
    return false;
};

/**
 * Makes a used reset-password code invalid
 * @param {string} code
 */
let disableCode = async (code) => {
    await User.findOneAndUpdate({ resetPasswordCode: code },
        { $set: { resetPasswordCode: null } }).exec();
};

/**
 * POST /account/register
 */
exports.createUser = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password[0];
    const confirmPassword = req.body.password[1];

    try {
        let user = await User.findOne({ email: email });
        if (user) {
            req.session.flash = {
                message: 'Du kan inte skapa ett konto med den här epostadressen',
                danger: true
            };
            return res.redirect('/account/register');

        } else {
            await validatePassword(password, confirmPassword);

            const hashedPassword = await bcrypt.hash(password, 10);
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
        }
        return res.redirect('/');
    } catch (err) {
        req.session.flash = {
            message: err.message,
            danger: true
        };

        return res.redirect('/account/register');
    }
};

/**
 * POST /account/login
 */
exports.loginUser = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        let user = await User.findOne({ email: email }).exec();
        if (!user) throwError(401, 'Felaktiga inloggningsuppgifter.');

        let success = await bcrypt.compare(password, user.password);
        if (!success) throwError(401, 'Felaktiga inloggningsuppgifter.');

        req.session.user = {
            email: email,
            id: user._id
        };
        req.session.flash = {
            message: `Välkommen, ${email}`,
            success: true
        };

        res.redirect(req.session.redirectTo || '/');
        delete req.session.redirectTo;
    } catch (err) {
        req.session.flash = {
            message: err.message,
            danger: true
        };

        return res.redirect('/account/login');
    }
};

/**
 * POST /account/forgot-password
 */
exports.resetPassword = async (req, res) => {
    const email = req.body.email;
    let user = await User.findOne({
        email: email
    }).exec();
    if (user) {
        let tempCode = crypto.randomBytes(20).toString('hex');

        const link = process.env.SERVER_DOMAIN;
        let resetLink = link + '/account/reset-password/' + tempCode;
        let hours = 2;
        let duration = 60 * 60 * hours; // duration in seconds
        let tempValue = {
            resetPasswordCode: tempCode,
            resetPasswordDate: Date.now() / 1000 + duration
        };

        try {
            if (user) {
                await User.findOneAndUpdate({ email: email },
                    { $set: tempValue }
                ).exec();

                let emailSettings = {
                    to: email,
                    subject: 'Återställ ditt lösenord',
                    message: `<p>Hej,</p>
                          <p>Du har fått detta e-postmeddelande eftersom du har begärt ett nytt lösenord för ditt konto på Arkivdium.</p>
                          <a href="${resetLink}">Klicka på denna länk för att skapa ditt nya lösenord</a> Länken är giltig i ${hours} timmar.
                          <p>Med vänliga hälsningar,<br>Vi på Arkivdium</p>`
                };

                EmailModel.sendMail(emailSettings);
                req.session.flash = {
                    message: `Om den angivna e-postadressen finns i vårt system så har vi nu skickat en återställningslänk till den.
                    Om du inte fick en återställningslänk, kolla din skräppost.`,
                    info: true
                };
                res.redirect('/');
            }
        } catch (err) {
            req.session.flash = {
                message: err.message,
                danger: true
            };
            return res.status(err.status || 400).render('account/forgot-password');
        }
    } else {
        let emailSettings = {
            to: email,
            subject: 'Återställning av lösenord',
            message: 'Någon har försökt återställa ett lösenord till den här e-posten men vi har den inte registrerad hos oss på Arkivdium.se.'
        };

        EmailModel.sendMail(emailSettings);
        req.session.flash = {
            message: 'Om den angivna e-postadressen finns i vårt system så har vi nu skickat en återställningslänk till den.',
            info: true
        };
        res.redirect('/');
    }
};

/**
 * GET /account/reset-password/:temporaryCode
 */
exports.validateLink = async (req, res) => {
    let resetUrl = {
        body: req.params.temporaryCode
    };
    if (await isValidCode(req.params.temporaryCode)) {
        return res.render('account/update-password', {
            loadValidation: true,
            resetUrl: resetUrl
        });
    }
    req.session.flash = {
        message: 'Länken har utgått!',
        danger: true
    };
    return res.redirect('/');
};

/**
 * POST /account/reset-password/:temporaryCode
 */
exports.updatePassword = async (req, res) => {
    const code = req.params.temporaryCode;

    if (await !isValidCode(code)) {
        req.session.flash = {
            message: 'Länken har utgått!',
            danger: true
        };
        return res.status(400).redirect('/');
    }

    const password = req.body.resetPassword;
    const confirmPassword = req.body.confirmPassword;
    try {
        await validatePassword(password, confirmPassword);
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate({ resetPasswordCode: code }, {
            $set: { password: hashedPassword }
        }).exec();
        await disableCode(code);

        req.session.flash = {
            message: 'Lösenordet har uppdaterats!',
            success: true
        };
        return res.redirect('/');
    } catch (err) {
        console.log(err);
        req.session.flash = {
            message: err.message,
            danger: true
        };

        return res.redirect('/account/reset-password/' + code);
    }
};

/**
 * POST /account/logout
 */
exports.logoutUser = (req, res) => {
    req.session.user = null;
    res.redirect('/');
};

/**
 * GET /account/register
 */
exports.getRegisterPage = (req, res) => {
    res.render('account/register', {
        loadValidation: true,
        active: {
            register: true
        },
    });
};

/**
 * GET /account/login
 */
exports.getLoginPage = (req, res) => {
    res.render('account/login', {
        active: {
            login: true
        },
    });
};

/**
 * GET /account/forgot-password
 */
exports.getPasswordResetPage = (req, res) => {
    res.render('account/forgot-password', {
        loadValidation: true
    });
};