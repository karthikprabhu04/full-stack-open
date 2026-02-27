const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const e = require('express')



// Reading data
blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog.find({}).populate('user')
    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

// Writing data
blogsRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body
    const user = request.user

    if (!user) {
      return response.status(400).json({ error: "userId missing or not valid"})
    }
    
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

// Deleting blogs
blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    const user = request.user

    if (!user) {
      return response.status(400).json({ error: "userId missing or not valid"})
    }
    
    if (!blog) {
      return response.status(404).end()
    }

    if (blog.user.toString() === user._id.toString()) {
      // Delete post
      await Blog.findByIdAndDelete(request.params.id)
      response.status(204).end()
    } else {
      return response.status(403).json({ error: "user logged in did not create this post"})
    }

  } catch (error) {
    next(error)
  }
})

// Updating blogs
blogsRouter.put('/:id', async (request, response, next) => {
  const { title, author, url, likes } = request.body

  const blog = {
    title,
    author,
    url,
    likes
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      blog,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    )

    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter