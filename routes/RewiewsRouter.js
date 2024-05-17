const Router = require('express')
const router = new Router
const RewiewsController = require('../controllers/rewiewsController')

router.get('/', RewiewsController.getRew)
router.post('/', RewiewsController.postRew)

module.exports = router