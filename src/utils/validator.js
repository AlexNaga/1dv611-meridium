const validEmail = require('email-validator');
const validUrl = require('valid-url');
const Setting = require('../models/enums').setting;

/**
 * Checks if the value is at or between two numbers
 * @param {*} a
 * @param {*} b
 */
Number.prototype.between = function (a, b) {
    var min = Math.min(a, b),
        max = Math.max(a, b);

    return this >= min && this <= max;
};

exports.validateHttrackSettings = (body, ownerId) => {
    let url = body.url;
    let includeDomains = body.includeDomains === '' || body.includeDomains === undefined ? [] : body.includeDomains.replace(' ', '').split(',');
    let excludePaths = body.excludePaths === '' || body.excludePaths === undefined ? [] : body.excludePaths.replace(' ', '').split(',');
    let robots = parseInt(body.robots);
    let structure = body.structure;
    let email = body.email;
    let error = undefined;
    let typeOfSetting = parseInt(body.setting);
    let advancedSetting = body.advancedSetting;
    let typeOfSchedule = parseInt(body.typeOfSchedule); // 0 = none, 1 = daily, 2 = weekly, 3 = monthly
    let isScheduled = parseInt(body.action);

    if (isScheduled.between(0, 1)) {
        isScheduled = isScheduled === 1; // action = name of buttons. 0 = Arkivera, 1 = Schemalägg
    } else {
        error = { message: 'Felaktig metod, välj arkivera eller spara.', danger: true };
    }
    if (!typeOfSchedule.between(0, 3)) {
        error = { message: 'Felaktig schemaläggning, kontrollera vald tid.', danger: true };
    }
    if (typeOfSetting === Setting.STANDARD) {
        if (url === undefined || !validUrl.isUri(url)) {
            error = { message: 'Fel url!', danger: true };
        }
        if (includeDomains[0] !== '' && includeDomains.every(domain => validUrl.isUri(domain)) === false) {
            error = { message: 'Fel sub-url!', danger: true };
        }
        if (!robots.between(0, 2)) {
            error = { message: 'Fel robot-inställningar!', danger: true };
        }
        if (validEmail.validate(email) === false) {
            error = { message: 'Fel epost!', danger: true };
        }
        // lägg till validering av structure
        // if (structure > 2 && structure < 0) {
        //     error = { message: 'Fel robot-inställningar!', danger: true };
        // }

    } else { // advanced setting
        if (validEmail.validate(email) === false) {
            error = { message: 'Fel epost!', danger: true };
        }
    }

    let httrackSettings = {
        url,            // url to crawl
        includeDomains, // including urls
        excludePaths,   // excluding paths
        robots,         // 0 = ignore all metadata and robots.txt. 1 = check all file types without directories. 2 = check all file types including directories.
        structure,      // 0 = default site structure.
        typeOfSetting,  // HTTrack uses this
        advancedSetting,   // HTTrack uses this
        ownerId,        // just pass along, HTTrack does not use this
        email,          // just pass along
        typeOfSchedule,  // just pass along
        isScheduled,    // just pass along

    };
    return { httrackSettings, error };
};