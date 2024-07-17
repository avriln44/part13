const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const User = require('../models/user')
const connectToMongo = require('../mongo_connection')
// const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoServer = require('./test_db')

describe('user_api test', () => {
    beforeAll(async () => {
        await mongoServer.start()
        const uri = mongoServer.getUri()
    
        await mongoose.connection.close()
        await connectToMongo(uri)
    })

    afterAll( async () => {
        await mongoose.connection.close()
        await mongoServer.stop()
    })
    const api = supertest(app)  

    describe('when there is initially one user in the database', () => {
    
        beforeEach(async () => {
            await User.deleteMany({})
    
            const passwordHash = await bcrypt.hash('password', 10)
            const user = new User({ username: 'root', passwordHash })
    
            await user.save()
        })
    
        test('creating a new user succeeds with a fresh username', async () => {
            const usersAtStart = await helper.usersInDb()
    
            const newUser = {
                username: 'newuser',
                name: 'New User',
                password: 'password'
            }
    
            await api
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect('Content-Type', /application\/json/)
    
            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    
            const usernames = usersAtEnd.map(u => u.username)
            expect(usernames).toContain(newUser.username)
        })
    
        test('creating a new user fails with proper statuscode and message if username is already taken', async () => {
            const usersAtStart = await helper.usersInDb()
    
            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'password'
            }
    
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
    
            const errorMessageExists = result.body.errors.some(error => error.includes('`username` to be unique'))
            expect(errorMessageExists).toBeTruthy()
    
            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })
    
        test('fetching all users succeeds', async () => {
            const usersAtStart = await helper.usersInDb()
    
            const result = await api
                .get('/api/users')
                .expect(200)
                .expect('Content-Type', /application\/json/)
    
            expect(result.body).toHaveLength(usersAtStart.length)
        })
    })
    
    describe('when the initial data is invalid', () => {
        beforeEach(async () => {
            await User.deleteMany({})
        })
    
        test('user name must be at lest 3 character long',async () => {
            const usersAtStart = await helper.usersInDb()
    
            const newUser = {
                username: 'me',
                name: 'Superuser',
                password: 'password'
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
    
            const errorMessageExists = result.body.errors.some(error => error.includes('`username` (`me`) is shorter than the minimum allowed length (3)'))
            expect(errorMessageExists).toBeTruthy()
            
    
            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })
        test('password must be at lest 3 character long',async () => {
            const usersAtStart = await helper.usersInDb()
    
            const newUser = {
                username: 'mee',
                name: 'Superuser',
                password: 'pa'
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
    
            const errorMessageExists = result.body.errors.some(error => error.includes('password length is shorter than 3'))
    
            expect(errorMessageExists).toBeTruthy()
            
    
            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })
    })
})