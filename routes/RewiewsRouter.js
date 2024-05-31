const Router = require('express')
const router = new Router
const RewiewsController = require('../controllers/rewiewsController')
const statController = require('../controllers/statController')

router.get('/', RewiewsController.getRew)
router.get('/test', statController.getStat)
router.post('/', RewiewsController.postRew)

module.exports = router
