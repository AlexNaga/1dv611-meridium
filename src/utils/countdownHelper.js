const dayjs = require('dayjs');
const ScheduleSetting = require('../models/enums').schedule;

/**
 * Handlebars helper for calculating when a schedule is supposed to run.
 * Shows days until > 1 day, then shows hours and then minutes
 *
 * @param {*} schedule
 */
module.exports = (schedule) => {
    if (schedule.typeOfSchedule === ScheduleSetting.NONE) {
        return false;
    }
    let endtime = getDiffBetweenDates(schedule);
    let t = Date.parse(endtime) - Date.parse(new Date());
    let minutes = Math.floor((t / 1000 / 60) % 60);
    let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    let days = Math.floor(t / (1000 * 60 * 60 * 24));

    if (hours < 1) {
        hours = Math.floor(minutes % 60);
        return hours + (minutes > 1 ? ' minuter' : ' minut');
    }
    if (days < 1) {
        hours = Math.floor(hours % 24);
        return hours + (hours > 1 ? ' timmar' : ' timme');
    } else {
        return days + (days > 1 ? ' dagar' : ' dag');
    }
};

/**
 * Gets the difference from today and when the schedule is supposed to run
 * @param {*} schedule
 * @returns A Javascript Date object
 */
function getDiffBetweenDates(schedule) {
    // Predefined settings, has to match the ones decided in scheduler.js
    // TODO : config file?
    let hourToRun = 3; // what hour of the day.
    let weekdayToRun = 1; // Sunday = 0, Monday = 1..

    let base = dayjs();
    let nextDaily = base.add(1, 'day').set('hour', hourToRun);
    let nextWeekly = base.startOf('week').add(1, 'week').add(weekdayToRun, 'day').set('hour', hourToRun);
    let nextMonthly = base.endOf('month').startOf('week').add(1, 'day').set('hour', hourToRun);
    let diff;

    if (schedule.typeOfSchedule === ScheduleSetting.DAILY) {
        diff = nextDaily.diff(base);
    } else if (schedule.typeOfSchedule === ScheduleSetting.WEEKLY) {
        diff = nextWeekly.diff(base);
    } else if (schedule.typeOfSchedule === ScheduleSetting.MONTHLY) {
        diff = nextMonthly.diff(base);

        // Quick bugfix https://github.com/1dv611-meridium/1dv611-meridium/issues/91
        if (diff < 0) {
            nextMonthly = base.add(1 , 'month').endOf('month').startOf('week').add(1, 'day').set('hour', hourToRun);
            diff = nextMonthly.diff(base);
        }
    }

    let diffHours = diff / 3600000; // 1 hour in ms
    return base.add(diffHours, 'hour').toDate();
}