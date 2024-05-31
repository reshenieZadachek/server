const Router = require('express')
const statController = require('../controllers/statController')
const router = new Router


router.get('/', statController.getStat)


module.exports = router
