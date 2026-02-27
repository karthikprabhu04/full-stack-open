const { describe, test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Blog = require('../models/blog')
const listHelper = require('../utils/list_helper')

const api = supertest(app)

// Test creating users in database
describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await listHelper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await listHelper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await listHelper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await listHelper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

// Username and password pairs
describe('rejects invalid username and password pairs', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  test('valid user is created', async () => {
    const newUser = {
      username: 'testUsername',
      name: 'testName',
      password: 'testPassword'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, 1)
  })

  test('user not created if password is too short', async () => {
    const newUser = {
      username: 'testUsername2',
      name: 'testName',
      password: 'tp'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    console.log(result.body)

    assert(result.body.error)
  })

  test('user not created if no username input', async () => {
    const newUser = {
      name: 'testName',
      password: 'testPassword'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert(result.body.error)
  })
})

// Check DELETE function
describe('Delete function works', async () => {
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
      username: 'user1',
      name: 'User One',
      password: 'password1'
    })

    await api.post('/api/users').send({
      username: 'user2',
      name: 'User Two',
      password: 'password2'
    })
  })

  test('creator can delete blog', async () => {
    const token = await loginAndGetToken('user1', 'password1')

    // create blog
    const blogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test blog',
        author: 'me',
        url: 'test.com'
      })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogId = blogResponse.body.id

    // delete
    await api
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    
    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, 0)
  })

  test('non-creator cannot delete blog', async () => {
    const token1 = await loginAndGetToken('user1', 'password1')
    const token2 = await loginAndGetToken('user2', 'password2')

    // user1 creates blog
    const blogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'protected blog',
        author: 'user1',
        url: 'test.com'
      })

    const blogId = blogResponse.body.id

    // user2 tries deleting
    await api
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403)
  })
})

// Cleanup after the tests to cut off database connection
after(async () => {
  await mongoose.connection.close()
})