const zipFolder = require('../utils/zipFolder');
const { URL } = require('url');
const { exec } = require('child_process');
const fs = require('fs-extra');
const moment = require('moment');
const path = require('path');
const validUrl = require('valid-url');
const getUrls = require('get-urls');

/**
 *
 * @param {string} settings The settings to archive.
 * @param {function} callback Function to be called when archive is done.
 */
function archive(settings, callback) {
    let timestamp = moment().format('YYYY-MM-DD_HH-mm-ss-SS'); // 2018-03-29_22-29-21-42
    let archivesFolderPath = path.join(__dirname + '/../../archives');
    let pathToFolder = '';
    let folderName = '';

    let command = '';

    if (settings.typeOfSetting === '0') {
        let hostname = new URL(settings.url).hostname;
        folderName = `${hostname}_${timestamp}`;
        pathToFolder = `${archivesFolderPath}/${folderName}`;
    
        settings.output = pathToFolder;
        command = createCommand(settings, callback);
    }
    if (settings.typeOfSetting === '1') {
        folderName = `hostname_${timestamp}`;
        pathToFolder = `${archivesFolderPath}/${folderName}`;

        let httrack = process.env.IS_RUNNING_LINUX_OS === 'true' ? 'httrack' : `"${process.cwd()}/httrack/httrack.exe"`;
        command = httrack + ' ' + settings.rawDataInput + ` -O ${pathToFolder}`;
    }

    let urls = getUrls(command);
    urls = [...urls];
    console.log(urls);
    for (let i = 0; i < urls.length; i++) {
        urls[i] = urls[i].substring(urls[i].indexOf('//') + 2);
    }

    console.log(command);

    exec(command, (error, stdout, stderr) => {
        if (error) return callback(error);

        for (let i = 0; i < urls.length; i++) {
            console.log('Url: ' + urls[i]);
            if (fs.existsSync(`${pathToFolder}/${urls[i]}`)) {
                fs.moveSync(`${pathToFolder}/${urls[i]}`, `${pathToFolder}/folderToZip/${urls[i]}`);
            }
        }

        let zipDest = `${pathToFolder}.zip`;
        zipFolder(`${pathToFolder}/folderToZip`, zipDest, (error, fileSize) => {
            if (error) return callback(error);

            // fs.remove(`${pathToFolder}`, error => {
            //     if (error) return callback(error);

            //     // Return everything thats needed for the calling method
            //     // to save archive and send email
            //     callback(null, {
            //         ownerId: settings.ownerId,
            //         zipFile: `${folderName}.zip`,
            //         fileSize: fileSize,
            //         path: zipDest,
            //         url: settings.url,
            //         email: settings.email
            //     });
            // });
        });
    });
}

function createCommand(settings, callback) {
    let httrack     = process.env.IS_RUNNING_LINUX_OS === 'true' ? 'httrack' : `"${process.cwd()}/httrack/httrack.exe"`;
    let url         = validUrl.isUri(settings.url) ? settings.url : callback('Httrackwrapper error. Invalid url.');
    let output      = '"' + settings.output + '"';
    let include     = Array.isArray(settings.includeDomains) ? settings.includeDomains.map(domain => `+*${domain}`) : '';
    let exclude     = Array.isArray(settings.excludePaths) ? settings.excludePaths.map(path => `-*${path}*`) : '';
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
