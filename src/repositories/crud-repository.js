const { Sequelize } = require("sequelize");
const { Logger } = require("../config");
const { StatusCodes } = require("http-status-codes");
const AppError = require('../utils/errors/app-error')

class CrudRepository {
    constructor(model) {
        this.model = model
    }

    async create(data) {
            const res = await this.model.create(data);
            return res;
    }

    async destroy(data) {
        const res = await this.model.destroy({
            where: {
                id: data
            }
        });
        if(!res) {
            throw new AppError('Not able to find resource', StatusCodes.NOT_FOUND)
        }
        return res;
    }

    async get(data) {
        const res = await this.model.findByPk(data);
        if(!res) {
            throw new AppError('Not able to find resource', StatusCodes.NOT_FOUND)
        }
        return res;
    }

    async getAll() {
        const res = await this.model.findAll();
        return res;
    }

    async update(id, data) {
        const res = await this.model.update(data, {
            where: {
                id: id
            }
        });
        if(!res[0]) {
            throw new AppError('Not able to find resource', StatusCodes.NOT_FOUND)
        }
        return res;
    }
}

module.exports = CrudRepository;