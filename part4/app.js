const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const config = require('./utils/config')
const blogsRouter = require('./controllers/blogs')

const app = express()
app.use(express.json())
app.use(cors())

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl, { family: 4 })

app.use(express.json())

app.use('/api/blogs', blogsRouter)

module.exports = app

