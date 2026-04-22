const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// Alamat: http://localhost:5000/api/trips/
router.get('/', tripController.getAllTrips);

// Alamat: http://localhost:5000/api/trips/:id
router.get('/:id', tripController.getTripById);

module.exports = router;