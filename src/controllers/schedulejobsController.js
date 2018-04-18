
const Schedule = require('../models/scheduledJobs');


exports.deleteSchedule = (req, res) => {
    let id = req.params.id;
    let url = req.params.url;

    Schedule.findOneAndRemove({ _id: id, ownerId: req.session.user.id }).exec()
        .then(() => {
            res.status(200).json({
                deleted: url
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