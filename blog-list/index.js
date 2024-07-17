const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')
const connectToMongo = require('./mongo_connection')

const runApp = async () => {
    await connectToMongo(config.MONGODB_URI)
    app.listen(config.PORT, () => {
        logger.info(`Server running on port ${config.PORT}`)
    })
}

runApp()
