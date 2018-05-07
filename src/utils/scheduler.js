const httrackWrapper = require('../models/httrackWrapper');
const validateHttrackSettings = require('./validateHttrackSettings');
const EmailModel = require('../models/emailModel');
const Schedules = require('../models/schedules');
const Archive = require('../models/archive');
const nodeSchedule = require('node-schedule');
const Schedule = require('../models/enums').schedule;

exports.nodeSchedule = nodeSchedule.scheduleJob('00 00 03 * * *', async () => {
    try {
        let schedules = await Schedules.find({ isPaused: false }).exec();

        let everyDay = schedules.filter(s => s.typeOfSchedule === Schedule.DAILY);
        let everyWeek = schedules.filter(s => s.typeOfSchedule === Schedule.WEEKLY);
        let everyMonth = schedules.filter(s => s.typeOfSchedule === Schedule.MONTHLY);

        let shouldBeArchived = everyDay;

        let today = new Date().getDay();
        // Run weekly schedules on mondays
        if (today === 1) {
            shouldBeArchived.push(...everyWeek);

            let d = new Date();
            let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            // Run monthly schedules on the last week of the months
            if (weekNo % 4 === 0) {
                shouldBeArchived.push(...everyMonth);
            }
        }

        for (let i = 0; i < shouldBeArchived.length; i++) {
            let httrackSettings = {
                ...shouldBeArchived[i]._doc,
                fromSchedule: shouldBeArchived[i]._doc._id
            };
            httrackSettings = validateHttrackSettings(httrackSettings);
            httrackWrapper.archive(httrackSettings);
        }
    } catch (err) {
        console.log(err);
    }
});