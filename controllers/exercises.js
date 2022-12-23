// create an instance of express routers
const express = require('express')
const db = require('../models')
const router = express.Router()
const axios = require('axios')

router.get('/', (req, res) => {
  res.render('exercises/index.ejs', {
    user: res.locals.user
  })
})

router.post('/', async (req, res) => {
  try {
    req.body.userId = res.locals.user.id
    const [favorite] = await db.exercise.findOrCreate({
      where: {
        name: req.body.name,
        type: req.body.type,
        muscle: req.body.muscle,
        equipment: req.body.equipment,
        difficulty: req.body.difficulty,
        instructions: req.body.instructions
      }
    })
    res.redirect('/exercises')
  } catch (err) {
    console.log(err)
  }
})

router.get('/testing', (req, res) => {
  res.render('exercises/testing.ejs', {
    user: res.locals.user
  })
})

router.get('/:muscle', async (req, res) => {
  const url =
    'https://api.api-ninjas.com/v1/exercises?muscle=' + req.params.muscle
  const config = {
    headers: {
      'X-Api-Key': process.env.API_KEY
    }
  }
  const getAPI = await axios.get(url, config)
  res.render('exercises/results.ejs', {
    user: res.locals.user,
    data: getAPI.data
  })
})

// export the router
module.exports = router
