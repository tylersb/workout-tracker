// required packages
require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const db = require('./models')
const crypto = require('crypto-js')

// app config
const app = express()
const PORT = process.env.PORT || 8000
app.set('view engine', 'ejs')
// parse request bodies from html forms
app.use(express.urlencoded({ extended: false }))
// tell express to parse incoming cookies
app.use(cookieParser())

// custom auth middleware that checks the cookies for a user id
// and it finds one, look up the user in the db
// tell all downstream routes about this user
app.use(async (req, res, next) => {
  try {
    if (req.cookies.userId) {
      // decrypt the user id and turn it into a string
      const decryptedId = crypto.AES.decrypt(
        req.cookies.userId,
        process.env.SECRET
      )
      const decryptedString = decryptedId.toString(crypto.enc.Utf8)
      // find user in db
      const user = await db.user.findByPk(decryptedString, {
        include: [db.workout, db.exercise],
        order: [
          [db.workout, 'date', 'ASC']
        ]
      })
      // mount the logged in user on the res.locals
      res.locals.user = user
    } else {
      // set the logged in user to be null for conditional rendering
      res.locals.user = null
    }

    // move on the the next middleware/route
    next()
  } catch (err) {
    // explicity set user to null if there is an error
    res.locals.user = null
    next() // go to the next thing
  }
})

// routes and controllers
app.get('/', (req, res) => {
  res.render('index.ejs', {
    user: res.locals.user
  })
})

app.use('/profile', require('./controllers/profile'))
app.use('/exercises', require('./controllers/exercises'))

// listen on a port
app.listen(PORT)
