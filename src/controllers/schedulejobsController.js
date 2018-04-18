
const fs = require('fs');
const Schedule = require('../models/scheduledJobs');

exports.deleteSchedule = (req, res) => {
    let id = req.params.id;
    let scheduleName = '';
    const deleteFile = require('util').promisify(fs.unlink);

    Schedule.findOneAndRemove({ _id: id, ownerId: req.session.user.id }).exec()
        .then((archive) => {
            scheduleName = archive.fileName;
            return deleteFile('archives/' + archive.fileName);
        })
        .then(() => {
            res.status(200).json({
                deleted: scheduleName
            });
        })
        .catch((err) => {
            // err.code ENOENT = No such file on disk, but removed entry removed from db.
            res.status(err.code === 'ENOENT' ? 404 : 400)
                .json({
                    error: 'No such file'
                });
        });
};