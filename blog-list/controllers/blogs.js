const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const mongoose = require('mongoose')

blogsRouter.get('/', async (request, response) => {
    const firstUser = await User.findOne({}) // find the first user
    const blogs = await Blog.find({}) // find all blogs

    // iterate over all blogs
    for (let blog of blogs) {
        if (!blog.user && firstUser) {
            // if user is not set
            blog.user = firstUser._id // set the first user's id
            await blog.save() // save the blog
        }
    }
    const populatedBlogs = await Blog.find({}).populate('user', {
        username: 1,
        name: 1,
        _id: 1,
    })

    return response.json(populatedBlogs)
})

blogsRouter.post('/', async (request, response, next) => {
    const body = request.body
    if (!request.token) {
        return response.status(403).json({ error: 'Unauthorized request' })
    }

    try {
        const user = request.user
        if (!user) {
            return response.status(403).json({ error: 'Unauthorized request' })
        }

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes === undefined ? 0 : body.likes,
            user: user._id,
        })
        await blog.save()

        const savedBlog = await Blog.findById(blog._id).populate('user')
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        return response.status(201).json(savedBlog.toJSON())
    } catch (exception) {
        return next(exception)
    }
})
blogsRouter.delete('/:id', async (request, response) => {
    const blog = await Blog.findById(
        new mongoose.Types.ObjectId(request.params.id)
    )

    if (!blog) {
        return response.status(404).json({ error: 'blog not found' })
    } else {
        if (request.user.id === blog.user.toString()) {
            await Blog.findByIdAndRemove(blog.id)
            return response.status(204).end()
        } else {
            return response.status(403).json({ error: 'Unauthorized' })
        }
    }
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const updatedBlog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    }

    const updatedBlogPost = await Blog.findByIdAndUpdate(
        request.params.id,
        updatedBlog,
        { new: true }
    )

    return response.json(updatedBlogPost.toJSON())
})

module.exports = blogsRouter
