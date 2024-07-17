const mongoose = require('mongoose')
const logger = require('./utils/logger')

const connectToMongo = async (mongoUri) => {
    logger.info('connecting to Mongo')
    try {
        await mongoose.connect(mongoUri)
        logger.info('connected to MongoDB')
    } catch (error) {
        logger.error('error connecting to MongoDB:', error.message)
    }
}

module.exports = connectToMongo