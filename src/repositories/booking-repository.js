const  { StatusCodes } = require('http-status-codes')
const { Op } = require('sequelize');
const { Booking } = require('../models');
const CrudRepository = require('./crud-repository');
const { Enums } = require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking);
    }

    async createBooking(data, transaction) {
        const response = await Booking.create(data, {transaction: transaction});
        return response;
    }

    async get(data, transaction) {
        const res = await this.model.findByPk(data, {transaction: transaction});
        if(!res) {
            throw new AppError('Not able to find resource', StatusCodes.NOT_FOUND)
        }
        return res;
    }

    async update(id, data, transaction) {
        const res = await this.model.update(data, {
            where: {
                id: id
            }
        }, {transaction: transaction});
        if(!res[0]) {
            throw new AppError('Not able to find resource', StatusCodes.NOT_FOUND)
        }
        return res;
    }

    async cancelOldBookings(timestamp) {
        const response = await Booking.update({status: CANCELLED},
            {
                where: {
                    [Op.and]: [
                {
                    createdAt: {
                        [Op.lt]: timestamp
                    }
                },
                {
                    status: {
                        [Op.ne]: BOOKED
                    }
                },
                {
                    status: {
                        [Op.ne]: CANCELLED
                    }
                }
            ]
        }
    })
        return response;
    }
}

module.exports = BookingRepository;
