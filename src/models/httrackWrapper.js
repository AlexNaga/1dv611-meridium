const zipFolder = require('../utils/zipFolder');
const { URL } = require('url');
const { exec } = require('child_process');
const fs = require('fs-extra');
const moment = require('moment');
const path = require('path');
const validUrl = require('valid-url');

/**
 *
 * @param {string} settings The settings to archive.
 * @param {function} callback Function to be called when archive is done.
 */
function archive(settings, ownerId, callback) {
    let hostname = new URL(settings.url).hostname;
    let timestamp = moment().format('YYYY-MM-DD_HH-mm-ss-SS'); // 2018-03-29_22-29-21-42
    let id = `${hostname}_${timestamp}`;
    let archivesPath = path.join(__dirname + '/../../archives');

    let command = '';
    if (typeof settings === 'string')
        command = settings;
    else
        command = createCommand({ output: `${archivesPath}/${id}`, ...settings });

    exec(command, (error, stdout, stderr) => {
        if (error) return callback(error);

        let folderToZip = '';
        if (fs.existsSync(`${archivesPath}/${id}/web`))
            folderToZip = `${archivesPath}/${id}/web`;
        else if (fs.existsSync(`${archivesPath}/${id}/${hostname}`))
            folderToZip = `${archivesPath}/${id}/${hostname}`;
        else
            callback('Httrackwrapper error. Could not find a folder to zip.');

        let zipDest = `${archivesPath}/${id}.zip`;
        zipFolder(folderToZip, zipDest, (error, fileSize) => {
            if (error) return callback(error);

            fs.remove(`${archivesPath}/${id}`, error => {
                if (error) return callback(error);

                callback(null, {
                    ownerId: ownerId,
                    zipFile: `${id}.zip`,
                    fileSize: fileSize,
                    path: zipDest
                });
            });
        });
    });
}

function createCommand(settings) {
    let httrack     = process.env.IS_RUNNING_LINUX_OS === 'true' ? 'httrack' : `"${process.cwd()}/httrack/httrack.exe"`;
    let url         = validUrl.isUri(settings.url) ? settings.url : callback('Httrackwrapper error. Invalid url.');
    let output      = '"' + settings.output + '"';
    let include     = settings.includeDomains.map(domain => `+*${domain}*`);
    let exclude     = settings.excludePaths.map(path => `-*${path}*`);
    let robots      = settings.robots;
    let structure   = settings.structure;

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
        '-%F', '"<!-- Arkivdium -->"',  // Footer content.
        `-f${2}`,                       // 2 = put all logs in a single log file.
        '-q'                            // Quiet mode. No questions. No log.
    ];

    return command.join(' ');
}

module.exports = { archive };
