const zipFolder = require('zip-folder');
const { URL } = require('url');
const { execFile } = require('child_process');
const fs = require('fs-extra');
const moment = require('moment');

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

    let baseFolder = `./${id}/`;
    let folderToZip = `./${id}/${hostname}`;
    let zipPath = `./${id}/${hostname}.zip`;
    let zipArchivePath = `./archives/${id}.zip`;

    let httrack = './httrack/httrack.exe'; // For Windows OS
    if (process.env.IS_RUNNING_LINUX_OS === 'true') {
        httrack = 'httrack';  // For Linux OS
    }

    // let httrackSettings = {
    //     'url': settings.url, // USER. url to crawl
    //     '-N': settings.siteStructure, // USER. 0 = default site structure.
    //     '-O': '/archives', // output dir
    //     '-q': true, // no questions
    //     '-A': 100000000000, // maximum transfer rate in bytes/seconds
    //     '-%c': 10, // maximum number of connections
    //     // '-%!': false, // crawl without limit. DO NOT USE
    //     '-C': 0, // cache. 0 = no cache. 1 = cache. 2 = see what works best.
    //     '-s': settings.metaData, // USER. 0 = ignore all metadata and robots.txt. 1 = check all file types without directories. 2 = check all file types including directories.
    //     '-%F': 'Arkivdium', //footer content
    //     '-f': 2, // 2 = put all logs in a single log file.
    //     '-*': settings.excludeUrls, // USER. excluding url 
    //     '+*': settings.includeUrls // USER. including url
    // }
    console.log(settings);
    console.log('asd');
    let excludeUrls = settings.excludeUrls.map(url => `-*${url}*`);
    console.log('dsa');
    console.log(excludeUrls);
    execFile(httrack, [
        settings.url,
        '-O', id,
        '-N0',
        // `-N${settings.siteStructure}`,
        // `-s${settings.robots}`,
        // ...excludeUrls,
        '+*https://help.github.com/*',
        // '-*/Om*',
        // '-*/jekyll/update/2016/11/17/klar.html*',
        '-q'
    ], (error, stdout, stderr) => {
    // execFile(httrack, [
    //     url,
    //     '-O',    // Output
    //     `${id}`, // Output directory name
    //     '-q',    // Quiet mode
    // ], (error, stdout, stderr) => {
        console.log(error);
        if (error) return callback(new Error(stderr.trim() + '. Command: ' + error.cmd));
        zipFolder(folderToZip, zipPath, (err) => {
            if (err) return callback(err);

            // Move the .zip file and overwrite existing file or directory
            fs.move(zipPath, zipArchivePath, { overwrite: true }, (err) => {
                if (err) return callback(err);

                fs.remove(baseFolder, err => {
                    if (err) return callback(err);

                    callback(null, { zipArchivePath: zipArchivePath });
                });
            });
        });
    });
}

module.exports = { archive };