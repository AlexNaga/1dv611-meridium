const path = require('path');

exports.sendFile = (req, res, next) => {
    let id = req.params.id;
    res.status(200).sendFile(path.join(__dirname + '/../archives/' + id));
};