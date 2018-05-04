const zipFolder = require('../utils/zipFolder');
const EmailModel = require('../models/emailModel');
const Archive = require('../models/archive');

const { URL } = require('url');
const { exec } = require('child_process');
const fs = require('fs-extra');
const dayjs = require('dayjs');
const path = require('path');
const validUrl = require('valid-url');
const getUrls = require('get-urls');
const Setting = require('../models/enums').setting;

/**
 *
 * @param {string} settings The settings to archive.
 */
async function archive(settings) {
    let PREVIEWS_FOLDER = path.join(__dirname + '/../../previews');
    let ARCHIVES_FOLDER = path.join(__dirname + `/../../${process.env.ARCHIVES_FOLDER}`);
    let ARCHIVE_ID = '';

    let date = dayjs().toObject();
    let timestamp = `${date.years}-${date.months}-${date.date}_${date.hours}-${date.minutes}-${date.seconds}-${date.milliseconds}`; // 2018-03-29_22-29-21-424

    let httrack = process.env.IS_RUNNING_LINUX_OS === 'true' ? 'httrack' : `"${process.cwd()}/httrack/httrack.exe"`;
    let command = '';

    if (settings.typeOfSetting === Setting.STANDARD) {
        let hostname = new URL(settings.url).hostname;
        ARCHIVE_ID = `${hostname}_${timestamp}`;

        settings.output = `${ARCHIVES_FOLDER}/${ARCHIVE_ID}`;
        command = createCommand(settings);
    } else if (settings.typeOfSetting === Setting.ADVANCED) {
        ARCHIVE_ID = `hostname_${timestamp}`;

        command = `${httrack} ${settings.advancedSetting} -O ${ARCHIVES_FOLDER}/${ARCHIVE_ID}`;
    }

    let urls = [...getUrls(command)];
    let previewUrl = urls[0];
    urls = urls.map(url => url.substring(url.indexOf('//') + 2));

    const previewCommand = `${httrack} ${previewUrl} -* +*.html +*.css +*.js "+*.jpg*[<150]" "+*.png*[<150]" -O "${PREVIEWS_FOLDER}/${ARCHIVE_ID}_original"`;

    console.log('command', command);
    console.log('previewCommand', previewCommand);

    try {
        // Preview
        await runCommand(previewCommand);
        await moveFolder(`${PREVIEWS_FOLDER}/${ARCHIVE_ID}_original/${urls[0]}`, `${PREVIEWS_FOLDER}/${ARCHIVE_ID}/`);
        removeFolder(`${PREVIEWS_FOLDER}/${ARCHIVE_ID}_original`);

        // Archive
        await runCommand(command);
        urls.forEach(async url => {
            await moveFolder(`${ARCHIVES_FOLDER}/${ARCHIVE_ID}/${url}`, `${ARCHIVES_FOLDER}/${ARCHIVE_ID}/folderToZip/${url}`);
            await moveFolder(`${ARCHIVES_FOLDER}/${ARCHIVE_ID}/www.${url}`, `${ARCHIVES_FOLDER}/${ARCHIVE_ID}/folderToZip/${url}`);
        });
        await moveFolder(`${ARCHIVES_FOLDER}/${ARCHIVE_ID}/web`, `${ARCHIVES_FOLDER}/${ARCHIVE_ID}/folderToZip/`);

        let fileSize = await zip(`${ARCHIVES_FOLDER}/${ARCHIVE_ID}/folderToZip`, `${ARCHIVES_FOLDER}/${ARCHIVE_ID}.zip`);
        removeFolder(`${ARCHIVES_FOLDER}/${ARCHIVE_ID}`);

        console.log(`Archive was successful!`);

        // Create archive in database
        let archive = new Archive({
            fileName: `${ARCHIVE_ID}.zip`,
            ownerId: settings.ownerId,
            fileSize: fileSize
        });
        await archive.save();

        // Send success email
        let downloadUrl = `${process.env.SERVER_DOMAIN}/${process.env.ARCHIVES_FOLDER}/${ARCHIVE_ID}.zip`;
        let emailSettings = {
            email: settings.email,
            subject: 'Arkiveringen är klar ✔',
            message: `<p><b>Din arkivering av
            <a href="${settings.url}">${settings.url}</a> är klar!</b></p>
            <p><a href="${downloadUrl}">Ladda ned som .zip</a></p>`
        };
        EmailModel.sendMail(emailSettings);
    } catch (err) {
        console.log(err);

        // Send fail mail
        let emailSettings = {
            email: err.email,
            subject: 'Din schemalagda arkivering kunde inte slutföras!',
            message: `<p><b>Din schemalagda arkivering av
            <a href="${err.url}">${err.url}</a> kunde inte slutföras.</b></p>`
        };
        EmailModel.sendMail(emailSettings);
    }
}

function zip(folder, zipDest) {
    return new Promise(function (resolve, reject) {
        zipFolder(folder, zipDest, (error, fileSize) => {
            if (error) {
                console.log(error);
                reject();
            }
            resolve(fileSize);
        });
    });
}

function moveFolder(orig, dest) {
    // TODO async och felhantering
    if (fs.existsSync(orig)) {
        fs.moveSync(orig, dest);
    }
}

function removeFolder(folder) {
    // TODO använd promise?
    fs.remove(folder, error => {
        if (error) throw `httrackWrapper error: Could not remove folder '${folder}'`;
    });
}

function runCommand(command) {
    return new Promise(function(resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) reject(error);
            resolve();
        });
    });
}

function createCommand(settings) {
    let httrack = process.env.IS_RUNNING_LINUX_OS === 'true' ? 'httrack' : `"${process.cwd()}/httrack/httrack.exe"`;
    let url = validUrl.isUri(settings.url) ? settings.url : callback('Httrackwrapper error. Invalid url.');
    let output = '"' + settings.output + '"';
    let include = Array.isArray(settings.includeDomains) && settings.includeDomains.length > 0 ? settings.includeDomains.map(domain => `+*${domain}`) : '';
    let exclude = Array.isArray(settings.excludePaths) && settings.excludePaths.length > 0 ? settings.excludePaths.map(path => `-*${path}*`) : '';
    let robots = settings.robots;
    let structure = settings.structure;

    let command = [
        httrack,
        url,                            // Url to crawl.
        '-O', output,                   // Output path.
        ...include,                     // Domains to include.
        ...exclude,                     // Paths to exclude.
        `-s${robots}`,                  // 0 = ignore all metadata and robots.txt. 1 = check all file types without directories. 2 = check all file types including directories.
        `-N${structure}`,               // Site structure. 0 = default site structure.
        `-A${100000000000}`,            // Maximum transfer rate in bytes/seconds.
        `-%c${10}`,                     // Maximum number of connections/seconds.
        // '-%!',                       // Crawl without limit. DO NOT USE.
        `-C${0}`,                       // Cache. 0 = no cache. 1 = cache. 2 = see what works best.
        // '-%F', '<!-- Arkivdium -->',    // Footer content.
        `-f${2}`,                       // 2 = put all logs in a single log file.
        '-q'                            // Quiet mode. No questions. No log.
    ];

    return command.join(' ');
}

module.exports = { archive };
