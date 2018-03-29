const zipFolder = require('zip-folder');
const { URL } = require('url');
const { execFile } = require('child_process');
const fs = require('fs-extra');

/**
 *
 * @param {string} id Unique identifier, also name of the created zip-file.
 * @param {string} url The URL to archive.
 * @param {function} callback Function to be called when archive is done.
 */
function archive(id, url, callback) {
    let hostname = new URL(url).hostname;
    let baseFolder = `./${hostname}_${id}/`;
    let folderToZip = baseFolder + hostname;

    let zipFilename = `${hostname}_${id}.zip`;
    let zipFilePath = baseFolder + zipFilename;

    let archiveZipFilename = './archives/' + zipFilename;

    // Uncomment this for Windows
    // const child = execFile('./httrack/httrack.exe', [

    const child = execFile('httrack', [
        url,
        '-O', // Output
        `${hostname}_${id}`,   // Output directory name
        '-q', // Quiet mode
    ], (err, stdout, stderr) => {
        if (err) throw new Error(stderr.trim() + '. Command: ' + err.cmd);

        zipFolder(folderToZip, zipFilePath, (err) => {
            if (err) throw err;

            // Move the zipfile and overwrite existing file or directory
            fs.move(zipFilePath, archiveZipFilename, { overwrite: true }, (err) => {
                if (err) throw err;

                fs.remove(baseFolder, err => {
                    if (err) throw err;

                    console.log('Folder deleted.');
                });
            });
        });

        callback();
    });
}

module.exports = archive;