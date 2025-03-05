const axios = require('axios');
const {StatusCodes} = require('http-status-codes')
const { BookingRepository } = require('../repositories');
const { FLIGHT_SERVICE } = require('../config/server-config')
const db = require('../models');
const  AppError = require('../utils/errors/app-error');
const { ServerConfig } = require('../config');
const { Enums } = require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

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


async function makePayment(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction);
        console.log(bookingDetails);
        if(bookingDetails.status == CANCELLED){
            throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST)
        }

        const bookingTime = new Date(bookingDetails.createdAt)
        const currentTime = new Date();
        if(currentTime - bookingTime > 300000) {
            await bookingRepository.update(data.bookingId, {status: CANCELLED}, transaction)
            throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST)
        }

        if(bookingDetails.totalCost !=data.totalCost){
            throw new AppError('The amount of the payment doesnt match', StatusCodes.BAD_REQUEST)
        }
        if(bookingDetails.userId != data.userId){
            throw new AppError('The user corresponding to the booking doesnt match', StatusCodes.BAD_REQUEST)
        }
        // we assume here payment is done
        bookingRepository.update(data.bookingId, {status: BOOKED}, transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}



module.exports = {
    createBooking,
    makePayment
}