let fs = require('fs');
let archiver = require('archiver');

/**
 * @param {string} srcFolder Folder to zip
 * @param {string} zipFilePath Destination
 * @return {Zip} Filesize in bytes
 * @typedef {Object} Zip
 * @property {Object} error
 * @property {Number} size
 *
 * Slightly modified from original source: https://github.com/sole/node-zip-folder
 */
function zipFolder(srcFolder, zipFilePath, callback) {
    let output = fs.createWriteStream(zipFilePath);
    let zipArchive = archiver('zip');

    output.on('close', () => {
        callback(null, zipArchive.pointer()); // sends back filesize in byte
    });

    zipArchive.pipe(output);

    if (Array.isArray(srcFolder)) {
        for (let i = 0; i < srcFolder.length; i++) {
            zipArchive.directory(srcFolder[i], true);
        }
    } else {
        zipArchive.directory(srcFolder, false);
    }

    zipArchive.finalize((err) => {
        if (err) callback(err, null);
    });
}

module.exports = zipFolder;
