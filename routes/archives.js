var express = require('express');
var router = express.Router();

const ArchivesController = require('../controllers/archives');

router.get('/:id', ArchivesController.sendFile);

module.exports = router;