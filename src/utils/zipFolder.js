let fs = require('fs');
let archiver = require('archiver');

/**
 * @param {string|string[]} srcFolders Folder(s) to zip
 * @param {string} zipFilePath Destination
 *
 * Slightly modified from original source: https://github.com/sole/node-zip-folder
 */
function zipFolder(srcFolders, zipFilePath, callback) {
    let output = fs.createWriteStream(zipFilePath);
    let zipArchive = archiver('zip');

    output.on('close', () => {
        callback(null, zipArchive.pointer()); // sends back filesize in byte
    });

    zipArchive.pipe(output);

    if (Array.isArray(srcFolders)) {
        for (let i = 0; i < srcFolders.length; i++) {
            zipArchive.directory(srcFolders[i], true);
        }
    } else {
        zipArchive.directory(srcFolders, false);
    }

    zipArchive.finalize((err) => {
        if (err) callback(err, null);
    });
}

module.exports = zipFolder;