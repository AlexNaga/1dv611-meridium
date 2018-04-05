const zipFolder = require('zip-folder');
const { URL } = require('url');
const { execFile } = require('child_process');
const fs = require('fs-extra');
const moment = require('moment');
const path = require('path');

/**
 *
 * @param {string} settings The settings to archive.
 * @param {function} callback Function to be called when archive is done.
 */
function archive(settings, callback) {
    let hostname = new URL(settings.url).hostname;
    let timestamp = moment().format('YYYY-MM-DD_HH:mm:ss'); // 2018-03-29_22:29:21
    let randomInt = Math.floor(Math.random() * (99 - 10 + 1) + 10); // Get a random integer between 10 and 99

    let id = `${hostname}_${timestamp}_${randomInt}`;

    let archivesPath = path.join(__dirname + '/../../archives');

    let crawlSettings = {
        isLinux: process.env.IS_RUNNING_LINUX_OS,
        url: settings.url,
        outputPath: `${archivesPath}/${id}`,
        includeDomains: settings.includeDomains.map(domain => `+*${domain}*`),
        excludePaths: settings.excludePaths.map(path => `-*${path}*`),
        robots: settings.robots,
        structure: settings.structure
    }
    crawl(crawlSettings, (error, response) => {
        if (error) return callback(error);

        let folderToZip = `${archivesPath}/${id}`;
        let zipDest = `${archivesPath}/${id}.zip`;
        zipFolder(folderToZip, zipDest, (error) => {
            if (error) return callback(error);

            fs.remove(folderToZip, error => {
                if (error) return callback(error);

                callback(null, { zipFile: `${id}.zip` });
            });
        });
    });
}

function crawl(settings, callback) {
    let httrack = './httrack/httrack.exe'; // For Windows OS
    if (settings.isLinux === 'true') httrack = 'httrack';  // For Linux/Mac OS

    execFile(httrack, [
        settings.url,               // Url to crawl.
        '-O', settings.outputPath,  // Output path.
        ...settings.includeDomains, // Domains to include.
        ...settings.excludePaths,   // Paths to exclude.
        `-N${settings.structure}`,  // Site structure. 0 = default site structure.
        `-s${settings.robots}`,     // 0 = ignore all metadata and robots.txt. 1 = check all file types without directories. 2 = check all file types including directories.
        `-A${100000000000}` ,       // Maximum transfer rate in bytes/seconds.
        `-%c${10}`,                 // Maximum number of connections/seconds.
        // '-%!',                   // Crawl without limit. DO NOT USE.
        `-C${0}`,                   // Cache. 0 = no cache. 1 = cache. 2 = see what works best.
        '-%F', '<!-- Arkivdium -->',// Footer content.
        `-f${2}`,                   // 2 = put all logs in a single log file.
        '-q'                        // Quiet mode. No questions. No log.
    ], (error, stdout, stderr) => {
        if (error) return callback(new Error(stderr.trim() + '. Command: ' + error.cmd));

        callback(null, {});
    });
}

module.exports = { archive };