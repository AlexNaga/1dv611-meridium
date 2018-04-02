const zipFolder = require('zip-folder');
const { URL } = require('url');
const { execFile } = require('child_process');
const fs = require('fs-extra');
const moment = require('moment');

/**
 *
 * @param {string} url The URL to archive.
 * @param {function} callback Function to be called when archive is done.
 */
function archive(url, callback) {
    let hostname = new URL(url).hostname;
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

    execFile(httrack, [
        url,
        '-O',    // Output
        `${id}`, // Output directory name
        '-q',    // Quiet mode
    ], (error, stdout, stderr) => {
        if (error) return callback(new Error(stderr.trim() + '. Command: ' + err.cmd));

        zipFolder(folderToZip, zipPath, (err) => {
            if (err) return callback(err);

            // Move the .zip file and overwrite existing file or directory
            fs.move(zipPath, zipArchivePath, { overwrite: true }, (err) => {
                if (err) return callback(err);

                fs.remove(baseFolder, err => {
                    if (err) return callback(err);

                    console.log('Folder deleted.');
                    callback(null, { zipArchivePath: zipArchivePath });
                });
            });
        });
    });
}

module.exports = { archive };