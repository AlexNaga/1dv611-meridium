var express = require('express');
var router = express.Router();

const ArchivesController = require('../controllers/archives');

// Create an archive
router.post('/', ArchivesController.createArchive);

// Get a specific archive
router.get('/:id', ArchivesController.getArchive);

module.exports = router;