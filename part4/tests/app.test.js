const { describe, test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const app = require('../app')
const User = require('../models/user')


const api = supertest(app)

// Create artifical database documents
const initalBlogs = [
  {
    title: "test title 1",
    author: "test1",
    url: "testurl1",
  },
  {
    title: "test title 2",
    author: "test2",
    url: "testurl2",
  }
]

// Setup before each test
beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initalBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initalBlogs[1])
  await blogObject.save()
})

describe.only('Basic tests for app', () => {
  const loginAndGetToken = async (username, password) => {
    const response = await api
      .post('/api/login')
      .send({ username, password })

    return response.body.token
  }

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    await api.post('/api/users').send({
      username: 'testuser',
      name: 'Test User',
      password: 'password'
    })
  })
  
  test('a valid blog can be added', async () => {
    const token = await loginAndGetToken('testuser', 'password')

    const newBlog = {
      title: 'authenticated blog',
      author: 'me',
      url: 'test.com',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
  })

  test('adding a blog fails with 401 if token is not provided', async () => {
    const newBlog = {
      title: 'no token blog',
      author: 'anonymous',
      url: 'test.com',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

describe('Enforce default properties', () => {
  // Test likes property
  test('Likes should default to 0 if missing', async () => {
    const newBlog = {
      title: "testing likes property",
      author: "Jack Smith",
      url: "testurl",
    }
    
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
    const latestBlog = response.body[response.body.length - 1]
  
    assert.strictEqual(latestBlog.likes, 0)
  })

  // Test for when title and url properties missing
  test('returns 400 if title is missing', async () => {
    const newBlog = {
      url: 'example.com',
      author: 'Jack Smith'
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })
  
  test('returns 400 if url is missing', async () => {
    const newBlog = {
      title: 'Testing validation',
      author: 'Jack Smith'
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })
})


describe('Updating and deleting posts', () => {
  // Test for deleting post
  test('Deletion of one post successfully', async () => {
    // Get id of a post
    const response = await api.get('/api/blogs')
    const latestBlog = response.body[response.body.length - 1]
    const latestBlogID = latestBlog.id
    // Remove id of a post
    await api
      .delete(`/api/blogs/${latestBlogID}`)
      .expect(204)
    // Check length of posts is one less
    const final = await api.get('/api/blogs')
    assert.strictEqual(final.body.length, initalBlogs.length - 1)
  })
  
  test('Update of one post', async () => {
    // Get existing blogs
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]
  
    // Update data
    const updatedData = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1
    }
  
    // Send PUT request
    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    // Verify likes updated
    assert.strictEqual(response.body.likes, updatedData.likes)
  
    // Verify DB actually updated
    const blogsAtEnd = await api.get('/api/blogs')
    const updatedBlog = blogsAtEnd.body.find(
      b => b.id === blogToUpdate.id
    )
  
    assert.strictEqual(updatedBlog.likes, updatedData.likes)
  })
})


// Cleanup after the tests to cut off database connection
after(async () => {
  await mongoose.connection.close()
})