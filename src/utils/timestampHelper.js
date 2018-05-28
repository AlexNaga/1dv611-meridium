/**
 * Handlebars helper for converting unix timestamp in seconds to pretty date.
 * "25 seconds ago" / "3 minutes ago" / "2 hours ago" / "2 days ago" / "December 25"
 * https://gist.github.com/vigikaran/d138cdcef3881cbc82c1cb71cac8b8d6
 *
 * Translated into Swedish.
@param {*} utcTime - Utc timestamp in ms (probably also works fo unix timestamp as well)
*/
module.exports = (utcTime) => {
    let timestamp = new Date(utcTime).getTime() / 1000;

    let date,
        monthNames,
        secs = ((new Date()).getTime() / 1000) - timestamp,
        minutes = secs / 60,
        hours = minutes / 60,
        days = hours / 24;
    // weeks = days / 7,
    // months = weeks / 4.34812,
    // years = months / 12;

    if (minutes < 1) {
        secs = Math.floor(secs % 60);
        return secs + (secs > 1 ? ' sekunder sedan' : ' sekund sedan');
    }
    if (hours < 1) {
        hours = Math.floor(minutes % 60);
        return hours + (minutes > 1 ? ' minuter sedan' : ' minut sedan');
    }
    if (days < 1) {
        hours = Math.floor(hours % 24);
        return hours + (hours > 1 ? ' timmar sedan' : ' timme sedan');
    } else if (days < 4) {
        days = Math.floor(days % 7);
        return days + (days > 1 ? ' dagar sedan' : ' dag sedan');
    } else {
        date = new Date(timestamp * 1000);
        monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
        return monthNames[date.getMonth()] + ' ' + date.getDate();
    }
};