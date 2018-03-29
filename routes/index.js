var express = require('express');
var router = express.Router();

const IndexController = require('../controllers/index');

router.get('/', IndexController.showHomePage);

module.exports = router;