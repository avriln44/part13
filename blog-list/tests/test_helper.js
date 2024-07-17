const Blog = require('../models/blog')
const User = require('../models/user')
const initialBlogs = [
    {
        title: 'Test Blog 1',
        author: 'Test Author 1',
        url: 'https://testblog1.com',
        likes: 10,
    },
    {
        title: 'Test Blog 2',
        author: 'Test Author 2',
        url: 'https://testblog2.com',
        likes: 5,
    },
]

const nonExistingId = async () => {
    const blog = new Blog({
        title: 'willremovethissoon',
        author: 'test author',
        url: 'https://testblog.com',
        likes: 5,
    })
    await blog.save()
    await blog.remove()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}
const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    initialBlogs,
    nonExistingId,
    blogsInDb,
    usersInDb
}
