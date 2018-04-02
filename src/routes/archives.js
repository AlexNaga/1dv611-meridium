var express = require('express');
var router = express.Router();

const ArchivesController = require('../controllers/archivesController');

// Create an archive
router.post('/', ArchivesController.createArchive);

// Lists all archives
router.get('/', ArchivesController.listArchives);

// Get a specific archive
router.get('/:id', ArchivesController.getArchive);

// Delete a specific archive
router.delete('/:id', ArchivesController.deleteArchive);

module.exports = router;