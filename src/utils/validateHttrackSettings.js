const validEmail = require('email-validator');
const validUrl = require('valid-url');
const throwError = require('./error');
const Setting = require('../models/enums').setting;

/**
 * Checks if the value is at or between two numbers
 * @param {*} a
 * @param {*} b
 */
Number.prototype.between = function(a, b) {
    let min = Math.min(a, b);
    let max = Math.max(a, b);

    return this >= min && this <= max;
};

/**
 * Returns a valid settings object with all required attributes
 * @param {object} settings 
 */
module.exports = (settings) => {
    // type of setting
    settings.typeOfSetting = parseInt(settings.typeOfSetting);
    if (settings.typeOfSetting.between(0, 1) === false) {
        throw Error('Fel inställningstyp.');
    }

    // type of schedule
    settings.typeOfSchedule = parseInt(settings.typeOfSchedule);
    if (settings.typeOfSchedule.between(0, 3) === false) {
        throw new Error('Felaktig schemaläggning, kontrollera vald tid.');
    }

    // email
    if (validEmail.validate(settings.email) === false) {
        throw new Error('Fel e-post!');
    }

    if (settings.typeOfSetting === Setting.STANDARD) {
        // url
        if (!validUrl.isUri(settings.url)) {
            throw new Error('Huvuddomän är inte korrekt.');
        }

        // include domains
        settings.includeDomains = settings.includeDomains.replace(/ /g, '').split(',');
        if (settings.includeDomains[0] !== '') {
            if (settings.includeDomains.every(domain => validUrl.isUri(domain)) === false) {
                throw new Error('En subdomän att arkivera är inte korrekt.');
            }
        }

        // exclude paths
        settings.excludePaths = settings.excludePaths.replace(/ /g, '').split(',');

        // robots
        settings.robots = parseInt(settings.robots);
        if (settings.robots.between(0, 2) === false) {
            throw new Error('Robot-inställningar är inte korrekt.');
        }

        // structure
        settings.structure = parseInt(settings.structure);
        if (settings.structure.between(0, 5) === false) {
            throw new Error('Strukturinställning är inte korrekt.');
        }

        return {
            typeOfSetting: settings.typeOfSetting,
            typeOfSchedule: settings.typeOfSchedule,
            email: settings.email,
            fromSchedule: settings.fromSchedule, // Pass along.
            ownerId: settings.ownerId, // Pass along.
            url: settings.url,
            includeDomains: settings.includeDomains,
            excludePaths: settings.excludePaths,
            robots: settings.robots,
            structure: settings.structure
        };
    }

    if (settings.typeOfSetting === Setting.ADVANCED) {
        let url = settings.advancedSetting.split(' ')[0];

        if (!validUrl.isUri(url)) {
            throw new Error('Felaktig url.');
        }
        if (settings.advancedSetting.includes('-O')) {
            throw new Error('Inte tillåtet att använda flagga "-O".');
        }

        return {
            typeOfSetting: settings.typeOfSetting,
            typeOfSchedule: settings.typeOfSchedule,
            advancedSetting: settings.advancedSetting,
            email: settings.email,
            fromSchedule: settings.fromSchedule, // Pass along.
            ownerId: settings.ownerId // Pass along.
        };
    }
};