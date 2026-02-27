const blog = require("../models/blog")
const User = require('../models/user')
const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((max, blog) => blog.likes > max.likes ? blog : max)
}

const topBlogger = (blogs) => {
  const authorCount = {}

  for (const blog of blogs) {
    const author = blog.author
    authorCount[author] = (authorCount[author] || 0) + 1
  }

  const result = Object.entries(authorCount).reduce(
    (top, [author, blogs]) =>
      blogs > top.blogs ? { author, blogs } : top,
    { author: null, blogs: 0}
  )

  return result
}

const topBloggerLodash = (blogs) => {
  const result = _(blogs)
    .groupBy('author')
    .map((blogs, author) => ({
      author,
      blogs: blogs.length
    }))
    .maxBy('blogs')

  return result
}

const topLikesLodash = (blogs) => {
  const result = _(blogs)
    .groupBy('author')
    .map((blogs, author) => ({
      author,
      likes: _.sumBy(blogs, 'likes')
    }))
    .maxBy('likes')

  return result
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  topBlogger,
  topBloggerLodash,
  topLikesLodash,
  usersInDb,
}