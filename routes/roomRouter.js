const Router = require('express')
const router = new Router
const RoomController = require('../controllers/roomController')


router.get('/my', RoomController.getMy)
router.get('/TESTROOMS', RoomController.testSetRoom)
router.get('/TESTUSERS', RoomController.testSetUsers)
router.get('/TESTDELETE', RoomController.testDELETE)
router.get('/testGETSECROOM', RoomController.testGETSECROOM)
router.post('/join', RoomController.joinRoom)
router.post('/end', RoomController.End0)


module.exports = router
