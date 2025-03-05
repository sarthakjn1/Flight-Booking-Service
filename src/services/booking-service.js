const axios = require('axios');
const {StatusCodes} = require('http-status-codes')
const { BookingRepository } = require('../repositories');
const { FLIGHT_SERVICE } = require('../config/server-config')
const db = require('../models');
const  AppError = require('../utils/errors/app-error');
const { ServerConfig } = require('../config');

const bookingRepository = new BookingRepository();

async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try{
        const flight = await axios.get(`${FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`)
        const flightData = flight.data.data
        if(data.noOfSeats > flightData.totalSeats) {
            throw new AppError('Require number of seats not available', StatusCodes.BAD_REQUEST);
        }
        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = { ... data, totalCost: totalBillingAmount}
        const booking = await bookingRepository.create(bookingPayload, transaction)

        const response = await axios.patch(`${FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
            seats: data.noOfSeats
        });

        return booking;
    } catch (error){
        await transaction.rollback();
        throw error;
    }
                   
}



module.exports = {
    createBooking
}