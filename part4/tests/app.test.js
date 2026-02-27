const { describe, test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const app = require('../app')


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
  test('notes are returned as json', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    console.log("Number of posts:", response.body.length)
  })

  test('verify that unique identifier is id and not _id', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const blog = response.body[0]
  
    assert.ok(blog.id)
    assert.strictEqual(blog._id, undefined)
  })

  test('post request saved successfully', async () => {
    const newBlog = {
      title: "new title post for test",
      author: "John Smith",
      url: "testurl",
    }
    
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
    const contents = response.body.map(r => r.title)
  
    assert.strictEqual(response.body.length, initalBlogs.length + 1)
    assert(contents.includes('new title post for test'))
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