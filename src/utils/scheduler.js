const nodeSchedule = require('node-schedule');
const httrackWrapper = require('../models/httrackWrapper');
const validateHttrackSettings = require('./validateHttrackSettings');
const Schedules = require('../models/schedules');
const Schedule = require('../models/enums').schedule;

/**
 * Run every day at 03 in the morning
 * RecurrenceRule (https://github.com/node-schedule/node-schedule#recurrence-rule-scheduling)
 * second (0-59)
 * minute (0-59)
 * hour (0-23)
 * date (1-31)
 * month (0-11)
 * year
 * dayOfWeek (0-6) Starting with Sunday
 */

var rule = new nodeSchedule.RecurrenceRule();
rule.hour = 3;

exports.nodeSchedule = nodeSchedule.scheduleJob(rule, async () => {
    try {
        let schedules = await Schedules.find({ isPaused: false }).exec();
        let shouldBeArchived = schedules.filter(s => s.typeOfSchedule === Schedule.DAILY);
        let today = new Date().getDay();
        // Run weekly schedules on mondays
        if (today === 1) {
            shouldBeArchived.push(...schedules.filter(s => s.typeOfSchedule === Schedule.WEEKLY));

            let d = new Date();
            let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            // Run monthly schedules on the last week of the months
            if (weekNo % 4 === 0) {
                shouldBeArchived.push(...schedules.filter(s => s.typeOfSchedule === Schedule.MONTHLY));
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