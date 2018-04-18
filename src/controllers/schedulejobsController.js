const Schedule = require('../models/scheduledJobs');

exports.listSchedule = (req, res) => {
    let page = req.query.page || 0;
    let itemsPerPage = 10;

    Schedule.find({ ownerId: req.session.user.id })
        .sort({ createdAt: 'desc' })
        .skip(page * itemsPerPage)
        .limit(itemsPerPage)
        .then(data => res.json({ schedules: data }))
        .catch((err) => {
            res.status(400).json({
                error: err
            });
        });
}

exports.updateSchedule = async (req, res) => {
    //TODO: Invänta sparafunktionen 
};

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