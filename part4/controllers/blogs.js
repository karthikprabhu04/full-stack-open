const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

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
    // Verify token
    const decodedToken = jwt.verify(getTokenFrom(request), config.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)

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

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

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