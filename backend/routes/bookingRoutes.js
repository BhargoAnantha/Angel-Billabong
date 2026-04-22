const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking); // POST untuk kirim data
router.get('/', bookingController.getAllBookings); // GET untuk cek hasil

module.exports = router;