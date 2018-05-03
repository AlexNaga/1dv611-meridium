const zipFolder = require('../utils/zipFolder');
const { URL } = require('url');
const { exec } = require('child_process');
const fs = require('fs-extra');
const dayjs = require('dayjs');
const path = require('path');
const validUrl = require('valid-url');
const getUrls = require('get-urls');

/**
 *
 * @param {string} settings The settings to archive.
 * @param {function} callback Function to be called when archive is done.
 */
function archive(settings, callback) {
    let errorResponse = { url: settings.url, email: settings.email };
    let date = dayjs().toObject();
    let timestamp = `${date.years}-${date.months}-${date.date}_${date.hours}-${date.minutes}-${date.seconds}-${date.milliseconds}`; // 2018-03-29_22-29-21-424
    let ARCHIVES_FOLDER = path.join(__dirname + `/../../${process.env.ARCHIVES_FOLDER}`);
    let previewFolderPath = path.join(__dirname + '/../../previews');
    let pathToFolder = '';
    let ARCHIVE_ID = '';
    let httrack = process.env.IS_RUNNING_LINUX_OS === 'true' ? 'httrack' : `"${process.cwd()}/httrack/httrack.exe"`;
    let command = '';

    if (parseInt(settings.typeOfSetting) === 0) { // standard settings
        let hostname = new URL(settings.url).hostname;
        ARCHIVE_ID = `${hostname}_${timestamp}`;
        pathToFolder = `${ARCHIVES_FOLDER}/${ARCHIVE_ID}`;

        settings.output = pathToFolder;
        command = createCommand(settings, callback);
    } else if (parseInt(settings.typeOfSetting) === 1) { // advanced settings
        ARCHIVE_ID = `hostname_${timestamp}`;
        pathToFolder = `${ARCHIVES_FOLDER}/${ARCHIVE_ID}`;

        command = httrack + ' ' + settings.advancedSetting + ` -O ${pathToFolder}`;
    }

    let urls = getUrls(command);
    urls = [...urls];
    let previewUrl = urls[0];

    for (let i = 0; i < urls.length; i++) {
        urls[i] = urls[i].substring(urls[i].indexOf('//') + 2);
    }

    console.log('command', command);

    const previewCommmand = `${httrack} ${previewUrl} -* +*.html +*.css +*.js "+*.jpg*[<150]" "+*.png*[<150]" -O "${previewFolderPath}/${ARCHIVE_ID}_original"`;
    console.log('previewCommmand', previewCommmand);

    // Run preview command
    exec(previewCommmand, (error, stdout, stderr) => {
        if (error) return callback(error, errorResponse);

        if (fs.existsSync(`${previewFolderPath}/${ARCHIVE_ID}_original/${urls[0]}`)) {
            fs.moveSync(`${previewFolderPath}/${ARCHIVE_ID}_original/${urls[0]}`, `${previewFolderPath}/${ARCHIVE_ID}`);
        }

        fs.remove(`${previewFolderPath}/${ARCHIVE_ID}_original`, error => {
            if (error) return callback(error, errorResponse);
        });
    });

    // Run archive command
    exec(command, (error, stdout, stderr) => {
        if (error) return callback(error, errorResponse);

        urls.forEach(url => {
            if (fs.existsSync(`${ARCHIVES_FOLDER}/${ARCHIVE_ID}/${url}`)) {
                fs.moveSync(`${ARCHIVES_FOLDER}/${ARCHIVE_ID}/${url}`, `${ARCHIVES_FOLDER}/${ARCHIVE_ID}/folderToZip/${url}`);
            }
            if (fs.existsSync(`${ARCHIVES_FOLDER}/${ARCHIVE_ID}/www.${url}`)) {
                fs.moveSync(`${ARCHIVES_FOLDER}/${ARCHIVE_ID}/www.${url}`, `${ARCHIVES_FOLDER}/${ARCHIVE_ID}/folderToZip/${url}`);
            }
        });

        if (fs.existsSync(`${pathToFolder}/web`)) {
            fs.moveSync(`${pathToFolder}/web`, `${pathToFolder}/folderToZip/`);
        }

        let zipDest = `${pathToFolder}.zip`;
        zipFolder(`${pathToFolder}/folderToZip`, zipDest, (error, fileSize) => {
            if (error) return callback(error, errorResponse);

            fs.remove(`${pathToFolder}`, error => {
                if (error) return callback(error, errorResponse);

                // Return everything thats needed for the calling method
                // to save archive and send email
                callback(null, {
                    ownerId: settings.ownerId,
                    zipFile: `${ARCHIVE_ID}.zip`,
                    fileSize: fileSize,
                    path: zipDest,
                    url: settings.url,
                    email: settings.email
                });
            });
        });
    });
}

function createCommand(settings, callback) {
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
