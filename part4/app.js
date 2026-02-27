const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const config = require('./utils/config')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')

const app = express()
app.use(express.json())
app.use(cors())

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl, { family: 4 })

app.use(express.json())

app.use('/api/login', loginRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app

