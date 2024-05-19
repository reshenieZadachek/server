const Router = require('express')
const router = new Router
const RoomController = require('../controllers/roomController')


router.get('/my', RoomController.getMy)
router.post('/join', RoomController.joinRoom)


module.exports = router
