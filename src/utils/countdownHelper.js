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
    let weekToRun = 4; // Last week in month

    let base = dayjs().startOf('hour');
    let daily = base.add(1, 'day').set('hour', hourToRun);
    let weekly = base.startOf('week').add(1, 'week').add(weekdayToRun, 'day').set('hour', hourToRun);
    let monthly = base.startOf('month').startOf('week').add(weekToRun, 'week').add(weekdayToRun, 'day').set('hour', hourToRun);
    let timeUntil;
    let diff;

    if (schedule.typeOfSchedule === ScheduleSetting.DAILY) {
        diff = daily.diff(base);
    } else if (schedule.typeOfSchedule === ScheduleSetting.WEEKLY) {
        diff = weekly.diff(base);
    } else if (schedule.typeOfSchedule === ScheduleSetting.MONTHLY) {
        diff = monthly.diff(base);
    }

    let diffHours = diff / 3600000; // 1 hour in ms
    timeUntil = dayjs().startOf('hour').add(diffHours, 'hour');

    return timeUntil.toDate();
}