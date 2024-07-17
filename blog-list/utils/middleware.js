const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response, next) => {
    return response.status(404).send({ error: 'unknown endpoint' })
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else {
        return response.status(400).json({ error: 'Not defined' })
    }
}

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    }
    return null
}

const tokenExtractor = ((req, res, next)=>{
    req.token=getTokenFrom(req)
    next()
})

const userExtractor= (async (req, res, next) =>{
    if (!req.token) {
        req.user = undefined
        return next()
    }
    const decodedToken=jwt.verify(req.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)
    req.user=user
    return next()
})

module.exports = {
    tokenExtractor,
    userExtractor,
    requestLogger,
    unknownEndpoint,
    errorHandler
}