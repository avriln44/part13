const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    const tokenPayload = {
        username: user.username,
        id: user._id,
    }

    return jwt.sign(tokenPayload, process.env.SECRET)
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.SECRET)
}

module.exports = { generateToken, verifyToken }
