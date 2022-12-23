// create an instance of express routers
const express = require('express')
const db = require('../models')
const router = express.Router()
const crypto = require('crypto-js')
const bcrypt = require('bcrypt')

// mount our routes on the router

// GET /profile -- show the user their profile page
router.get('/', (req, res) => {
  // if the user is not logged in -- they are not allowed to be here
  if (!res.locals.user) {
    res.redirect(
      '/profile/login?message=You must authenticate before you are authorized to view this resource!'
    )
  } else {
    res.render('profile/profile.ejs', {
      user: res.locals.user
    })
  }
})

// GET /profile/new -- serves a form to create a new user
router.get('/new', (req, res) => {
  res.render('profile/new.ejs', {
    user: res.locals.user
  })
})

// POST /profile -- creates a new user from the form @ /profile/new
router.post('/', async (req, res) => {
  try {
    // based on the info in the req.body, find or create user
    const [newUser, created] = await db.user.findOrCreate({
      where: {
        email: req.body.email
      }
    })
    // if the user is found, redirect user to login
    if (!created) {
      console.log('user exists!')
      res.redirect('/profile/login?message=Please log in to continue.')
    } else {
      // here we know its a new user
      // hash the supplied password
      const hashedPassword = bcrypt.hashSync(req.body.password, 12)
      // save the user with the new password
      newUser.password = hashedPassword
      await newUser.save() // actually save the new password in th db
      // ecrypt the new user's id and convert it to a string
      const encryptedId = crypto.AES.encrypt(
        String(newUser.id),
        process.env.SECRET
      )
      const encryptedIdString = encryptedId.toString()
      // place the encrypted id in a cookie
      res.cookie('userId', encryptedIdString)
      // redirect to user's profile
      res.redirect('/profile')
    }
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
})

// GET /profile/login -- render a login form that POSTs to /profile/login
router.get('/login', (req, res) => {
  res.render('profile/login.ejs', {
    message: req.query.message ? req.query.message : null,
    user: res.locals.user
  })
})

// POST /profile/login -- ingest data from form rendered @ GET /profile/login
router.post('/login', async (req, res) => {
  try {
    // look up the user based on their email
    const user = await db.user.findOne({
      where: {
        email: req.body.email
      }
    })
    // boilerplate message if login fails
    const badCredentialMessage = 'Email or password incorrect'
    if (!user) {
      // if the user isn't found in the db
      res.redirect('/profile/login?message=' + badCredentialMessage)
    } else if (!bcrypt.compareSync(req.body.password, user.password)) {
      // if the user's supplied password is incorrect
      res.redirect('/profile/login?message=' + badCredentialMessage)
    } else {
      // if the user is found and their password matches log them in
      // ecrypt the new user's id and convert it to a string
      const encryptedId = crypto.AES.encrypt(
        String(user.id),
        process.env.SECRET
      )
      const encryptedIdString = encryptedId.toString()
      // place the encrypted id in a cookie
      res.cookie('userId', encryptedIdString)
      res.redirect('/profile')
    }
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
})

// GET /profile/logout -- clear any cookies and redirect to the homepage
router.get('/logout', (req, res) => {
  // log the user out by removing the cookie
  // make a get req to /
  res.clearCookie('userId')
  res.redirect('/')
})

// export the router
module.exports = router
