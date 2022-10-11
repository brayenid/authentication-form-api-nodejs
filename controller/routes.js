import express from 'express'
import User from '../models/users.js'
import bcrypt from 'bcryptjs'
import isEmail from 'validator/lib/isEmail.js'
const router = express.Router()

router.get('/', (req, res, next) => {
  res.status(200).send({
    message: 'You are logged out!',
  })
})
//Only logged in page
router.get('/logged', (req, res, next) => {
  User.findOne({ unique_id: req.session.userId }, async (err, data) => {
    if (!data) {
      res.redirect('/')
    } else {
      res.status(200).send({
        message: 'You are logged!',
      })
    }
  })
})
router.post('/register', (req, res, next) => {
  if (isEmail(req.body.email)) {
    User.findOne({ email: req.body.email }, (err, data) => {
      if (!data) {
        if (req.body.password == req.body.passwordConf) {
          User.findOne({ username: req.body.username }, (err, data) => {
            if (!data) {
              let c
              User.findOne({}, (err, data) => {
                if (data) {
                  c = data.unique_id + 1
                } else {
                  c = 1
                }
                bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(req.body.password, salt, (err, hash) => {
                    const newPerson = new User({
                      unique_id: c,
                      email: req.body.email,
                      username: req.body.username,
                      password: hash,
                    })
                    newPerson.save()
                  })
                })
              })
                .sort({ _id: -1 })
                .limit(1)
              res.status(201).send({
                message: `Registered! as ${req.body.username}`,
              })
            } else {
              res.send({ message: 'Username already taken!' })
            }
          })
        } else {
          res.send({ message: 'Password is not matched!' })
        }
      } else {
        res.send({ message: 'Email already taken!' })
      }
    })
  } else {
    res.send({
      message: 'This is not email!',
    })
  }
})

router.post('/login', (req, res, next) => {
  User.findOne({ username: req.body.username }, (err, data) => {
    if (data) {
      bcrypt.compare(req.body.password, data.password, (err, resPass) => {
        if (resPass) {
          req.session.userId = data.unique_id
          res.send({
            message: `You are login as ${data.username}`,
          })
        } else {
          res.send({
            message: 'Wrong password!',
          })
        }
      })
    } else {
      res.send({
        message: 'This username is not registered!',
      })
    }
  })
})
router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err)
      } else {
        res.send({
          message: 'Logout success!',
        })
      }
    })
  }
})
export default router
