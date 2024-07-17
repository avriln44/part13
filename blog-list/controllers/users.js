const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body
    if (password.length < 3) {
        return response
            .status(400)
            .json({ errors: ['password length is shorter than 3'] })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })
    try {
        const savedUser = await user.save()
        return response.status(201).json(savedUser)
    } catch (e) {
        const errorKeys = Object.keys(e.errors)
        const errorMessages = errorKeys.map((key) => e.errors[key].message)

        return response.status(400).json({ errors: errorMessages })
    }
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', {})

    response.json(users)
})

module.exports = usersRouter
