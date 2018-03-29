const path = require('path');

exports.showHomePage = (req, res, next) => {
    res.status(200).sendFile(path.join(__dirname + '/../public/index.htm'));
};