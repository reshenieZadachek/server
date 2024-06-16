const Router = require('express')
const router = new Router
const UserController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/login', UserController.login)
router.post('/registration', UserController.registration)
router.post('/change/img', UserController.changeProfImg)
router.post('/change/common', UserController.changeProfCommon)
router.post('/change/security', UserController.changeProfSecurity)
router.get('/getLead/:id', UserController.httpGetDiscount)
router.get('/myhistory', authMiddleware, UserController.getMyHistory)
//router.post('/change/other', UserController.changeProfOther)
router.get('/auth', authMiddleware, UserController.check)



module.exports = router