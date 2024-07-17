
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const connectToMongo = require('../mongo_connection')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const mongoServer = require('./test_db')
const User = require('../models/user')
const { generateToken } = require('../utils/token')

describe('blog_api test', () => {
    const api = supertest(app)

    beforeAll(async () => {
        await mongoServer.start()
        const uri = mongoServer.getUri()
        await connectToMongo(uri)
    })

    afterAll( async () => {
        await mongoose.connection.close()
        await mongoServer.stop()
    })  

    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
    })
    
    describe('blog tests', () => {
        test('blogs are returned as json', async () => {
            await api
                .get('/api/blogs')
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })
    
        test('the unique identifier property of a blog post is named id', async () => {
            const response = await api.get('/api/blogs')
            expect(response.body[0].id).toBeDefined()
        })
    })
    
    describe('blog addition', () => {
        let token  
        beforeAll(async () => {
            await User.deleteMany({})
            const passwordHash = await bcrypt.hash('password', 10)
            const user = new User({ username: 'root', passwordHash })
            await user.save()
            token=generateToken(user)
        })

        afterAll(async () => {
            await User.deleteMany({})
        })

        test('a valid blog can be added', async () => {
            const newBlog = {
                title: 'A New Blog',
                author: 'New Author',
                url: 'https://newblog.com',
                likes: 0,
            }
    
            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)
    
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    
            const titles = blogsAtEnd.map((blog) => blog.title)
            expect(titles).toContain('A New Blog')
        })
        test('blog without likes is added with 0 likes', async () => {
            const newBlog = {
                title: 'another New Blog',
                author: 'New Author',
                url: 'https://newblog.com',
            }
        
            const response = await api.post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog).expect(201)
        
            expect(response.body.likes).toBe(0)
        })
        
        test('blog without title is not added', async () => {
            const newBlog = {
                author: 'New Author',
                url: 'https://newblog.com',
                likes: 5,
            }
        
            await api.post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog).expect(400)
        
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
        })
        
        test('blog without url is not added', async () => {
            const newBlog = {
                title: 'New Blog',
                author: 'New Author',
                likes: 5,
            }
        
            await api.post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog).expect(400)
        
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
        })
    })
    
    describe('deletion of a note', () => {
        let token
        let blogToDelete

        beforeEach(async () => {
            await User.deleteMany({})
            const passwordHash = await bcrypt.hash('password', 10)
            const user = new User({ username: 'root', passwordHash })
            await user.save()
            token=generateToken(user)
            
            blogToDelete = new Blog({
                title: 'blog to delete',
                author: 'no author anymore',
                url: 'dgfsgfsa',
                likes: 9,
                user: user._id,
            })
            await blogToDelete.save()
        })

        afterEach(async () => {
            await User.deleteMany({})
        })

        test('succeeds with status code 204 if id is valid', async () => {
            await api
                .delete(`/api/blogs/${blogToDelete._id.toString()}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)    
            const blogsInDb = await helper.blogsInDb()
            expect(blogsInDb).toHaveLength(helper.initialBlogs.length)                   
        })
    })

    describe('updating the information of an individual blog post', () => {
        test('updating a blog post likes succeeds with valid data', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]
    
            const updatedBlog = {
                title: 'willremovethissoon',
                author: 'test author',
                url: 'https://testblog.com',
                likes: 10,
            }
    
            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(updatedBlog)
                .expect(200)
    
            const blogsAtEnd = await helper.blogsInDb()
            const updatedBlogInDb = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
    
            expect(updatedBlogInDb.likes).toBe(updatedBlog.likes)
        })
    })  
})

