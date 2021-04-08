var express = require('express');
var router = express.Router();
const models = require('../models')
const bcrypt = require('bcrypt')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// POST
router.post('/register', async (req, res) => {
  //? check for username and password on request, just to see if they exist
  if (!req.body.username || !req.body.password) {
    return res.status(401).json({
      error: "Please include username and password"
    })
  }

  // ? check database for existing user of what they put into the field
  const user = await models.User.findOne({
    where: {
      username: req.body.username
    }
  })
    
    // ?if exists, send error
  if (user) {
    return res.status(400).json({
      error: 'Username already in use'
    })
  }

  // ? hash password
  const hash = await bcrypt.hash(req.body.password, 10)
  
  // ? create user
  const newUser = await models.User.create({
    username: req.body.username,
    password: hash
  })

    // ? respond with success message
    return res.status(201).json(newUser)
})

router.post('/login', async(req, res) => {
  // ? check or username and password
    // ? if it doesnt exist send error
    if (!req.body.username || !req.body.password) {
      return res.status(401).json({
        error: "Please include username and password"
      })
    }
  
    
    // ? find user from username
    const user = await models.User.findOne({
      where: {
        username: req.body.username
      }
    })

      // ? if no user, send error
  if (!user) {
    return res.status(404).json({
      error: 'Username already in use'
    })
  }


  //? check password
  const match = await bcrypt.compare(req.body.password, user.password)
    // ?if no match, send error
  if (!match) {
    return res.status(401).json({
      error: 'Password incorrect'
    })
  }

  // ? store user info in session
  req.session.user = user;

  // ? respond with user info
  res.json(user)
})
router.get('/logout',(req, res) => {
  // ? clear user data from session
  req.session.user = null

// ? send success response
res.json({
  success: 'Logged out successfully'
})
})

module.exports = router;