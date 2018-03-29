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
	const child = execFile('./httrack/httrack.exe', [
		url,
		'-O', // output
		id, // output directory name
		'-q', // no questions - quiet mode
	], (err, stdout, stderr) => {
		if (err) throw new Error(stderr.trim() + '. Command: ' + err.cmd);

		let hostname = new URL(url).hostname;
		let baseFolder = `./${id}/`;
		let folderToZip = baseFolder + hostname;

		let zipFilename = `${id}.zip`;
		let zipFilePath = baseFolder + zipFilename;

		let archiveFolder = './archive/';
		let archiveZipFilename = archiveFolder + zipFilename;

		zipFolder(folderToZip, zipFilePath, (err) => {
			if (err) throw err;

			// Move the zipfile and overwrite existing file or directory
			fs.move(zipFilePath, archiveZipFilename, { overwrite: true }, (err) => {
				if (err) throw err;

				fs.remove(baseFolder, err => {
					if (err) throw err;

					console.log('folder deleted');
				});
			});
		});

		callback();
	});
}

module.exports = archive;