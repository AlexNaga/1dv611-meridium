const fs = require('fs-extra');
const Schedule = require('../models/schedules');
const Archive = require('../models/archive');
const httrackWrapper = require('../models/httrackWrapper');
const validateHttrackSettings = require('../utils/validateHttrackSettings');

/**
 * DELETE /schedules/delete/:id
 */
exports.deleteSchedule = async (req, res) => {
    try {
        let schedule = await Schedule.findOneAndRemove({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();

        let archives = await Archive.find({
            fromSchedule: schedule.id
        }).exec();

        for (let i = 0; i < archives.length; i++) {
            const archive = archives[i];
            const deleteFolder = require('util').promisify(fs.remove);
            const deleteFile = require('util').promisify(fs.unlink);
            await deleteFolder(`./${process.env.PREVIEWS_FOLDER}/${archive.id}`);
            await deleteFile(`./${process.env.ARCHIVES_FOLDER}/${archive.fileName}`);
            archive.remove();
        }

        res.status(200).json({
            message: 'Schemaläggningen har raderats.',
            success: true
        });
    } catch (err) {
        if (err.code === 'ENOENT') {
            // TODO : Log faults
            //No such file on disk, but entry removed from db
            res.status(200).json({
                message: 'Schemaläggningen har raderats.',
                success: true
            });
        } else {
            res.status(400)
                .json({
                    message: 'Kunde inte radera Schemaläggningen.',
                    danger: true
                });
        }
    }
};

/*
 * POST /schedule/run/:id
 */
exports.runSchedule = async (req, res) => {
    try {
        let schedule = await Schedule.findOne({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();

        let httrackSettings = {
            ...schedule._doc,
            fromSchedule: schedule._doc._id
        };
        httrackSettings = validateHttrackSettings(httrackSettings);
        httrackWrapper.archive(httrackSettings);
        if (schedule.shouldNotify) {
            req.session.flash = {
                message: 'Arkiveringen är startad. Du kommer notifieras via e-post när arkiveringen är klar.',
                info: true
            };
        } else {
            req.session.flash = {
                message: 'Arkiveringen är startad.',
                info: true
            }
        }
        res.redirect('/archives/edit/' + req.params.id);
    } catch (err) {
        console.log(err);
        req.session.flash = {
            message: 'Kunde inte starta arkiveringen!',
            danger: true
        };
        res.redirect('/archives/edit/' + req.params.id);
    }
};

/*
 * POST /schedule/pause/:id
 */
exports.pauseSchedule = async (req, res) => {
    try {
        let schedule = await Schedule.findOne({
            _id: req.params.id,
            ownerId: req.session.user.id
        }).exec();
        schedule.isPaused = !schedule.isPaused;
        await schedule.save();

        res.json({
            success: true
        });
    } catch (err) {
        res.json({
            success: false,
            message: 'Något gick fel, försök igen senare.'
        });
    }
};