const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

const tokenService = require('../utils/token')

loginRouter.post('/', async (request, response) => {
    const body = request.body

    const user = await User.findOne({ username: body.username })
    const passwordCorrect =
        user === null
            ? false
            : await bcrypt.compare(body.password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password',
        })
    }

    const token = tokenService.generateToken(user)
    response
        .status(200)
        .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
