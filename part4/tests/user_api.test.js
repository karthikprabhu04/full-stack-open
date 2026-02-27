const { describe, test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const User = require('../models/user')
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
describe.only('rejects invalid username and password pairs', () => {
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

// Cleanup after the tests to cut off database connection
after(async () => {
  await mongoose.connection.close()
})