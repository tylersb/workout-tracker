// create an instance of express routers
const express = require('express')
const db = require('../models')
const router = express.Router()
const axios = require('axios')
const methodOverride = require('method-override')

router.use(methodOverride('_method'))

// GET /exercises -- show list of muscles to search for
router.get('/', (req, res) => {
  res.render('exercises/index.ejs', {
    user: res.locals.user
  })
})

// POST /exercises -- add new exercises to favorites
router.post('/', async (req, res) => {
  try {
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
    const user = await db.user.findByPk(res.locals.user.id)
    const hasLink = await user.hasExercise(favorite)
    if (!hasLink) {
      user.addExercise(favorite)
    }
    res.redirect('/exercises')
  } catch (err) {
    res.status(500).send('server error')
  }
})

// DELETE /exercises -- remove exercises from favorites
router.delete('/', async (req, res) => {
  try {
    const favorite = await db.exercise.findOne({
      where: {
        name: req.body.name,
        type: req.body.type,
        muscle: req.body.muscle,
        equipment: req.body.equipment,
        difficulty: req.body.difficulty,
        instructions: req.body.instructions
      }
    })
    const user = await db.user.findByPk(res.locals.user.id)
    user.removeExercise(favorite)
    res.redirect('/exercises')
  } catch (err) {
    res.status(500).send('server error')
  }
})

// GET /exercises/:muscle -- show list of exercises for a given muscle
router.get('/:muscle', async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).send('server error')
  }
})

// export the router
module.exports = router
