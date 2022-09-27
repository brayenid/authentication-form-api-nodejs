import express from 'express'
import router from './controller/routes.js'
import mongoose from 'mongoose'
import session from 'express-session'
import MongoStore from 'connect-mongo'
const app = express()
const port = 3000
const dbUrl = 'mongodb://localhost:27017/myloginsystem'

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('connection DB success')
})

app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: 'holo',
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: dbUrl,
    }),
  })
)
app.use('/', router)

app.listen(port, () => {
  console.log(`Server http://localhost:${port}`)
})
