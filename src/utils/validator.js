const validEmail = require('email-validator');
const validUrl = require('valid-url');

exports.validateHttrackSettings = (body, ownerId) => {
    let url = body.url;
    let includeDomains = body.includeDomains === undefined ? [] : body.includeDomains.replace(' ', '').split(',');
    let excludePaths = body.excludePaths === undefined ? [] : body.excludePaths.replace(' ', '').split(',');
    let robots = body.robots;
    let structure = body.structure;
    let email = body.email;
    let isScheduled = (body.action === '1'); // action = name of buttons. 0 = Arkivera, 1 = Schemalägg
    let typeOfSchedule = body.typeOfSchedule; // 0 = none, 1 = daily, 2 = weekly, 3 = monthly
    let error = undefined;
    let typeOfSetting = body.setting;
    let rawDataInput = body.rawDataInput;

    if (typeOfSetting === '0') { // standard setting
        if (url === undefined || !validUrl.isUri(url)) {
            error = { message: 'Fel url!', danger: true };
        }
        if (includeDomains[0] !== '' && includeDomains.every(domain => validUrl.isUri(domain)) === false) {
            error = { message: 'Fel sub-url!', danger: true };
        }
        if (body.robots > 2 && body.robots < 0) {
            error = { message: 'Fel robot-inställningar!', danger: true };
        }
        if (validEmail.validate(email) === false) {
            error = { message: 'Fel epost!', danger: true };
        }
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
        rawDataInput,   // HTTrack uses this
        ownerId,        // just pass along, HTTrack does not use this
        email,          // just pass along
        typeOfSchedule,  // just pass along
        isScheduled,    // just pass along

    };
    return { httrackSettings, error };
};