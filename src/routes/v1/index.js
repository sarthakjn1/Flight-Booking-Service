const express = require('express');

const { InfoController } = require("../../controllers/index.js")
const bookingRoutes = require("./booking.js")

const router = express.Router()

router.get('/info', InfoController.info);

router.use('/bookings', bookingRoutes)


module.exports = router;