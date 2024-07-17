require('dotenv').config()
console.log('process.env.NODE_ENV = ', process.env.NODE_ENV)
console.log('process.env.TEST_MONGODB_URI = ', process.env.TEST_MONGODB_URI)
const PORT = process.env.PORT
const MONGODB_URI = process.env.NODE_ENV === 'test' 
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

// eslint-disable-next-line no-unused-vars
const SECRET = process.env.SECRET

module.exports = {
    MONGODB_URI,
    PORT
}