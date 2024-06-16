const Router = require('express')
const adminController = require('../controllers/adminController')
const router = new Router
const authMiddleware = require('../middleware/authMiddleware')

router.get('/getbanpeople/:id', authMiddleware, adminController.getBanUser)
router.get('/getbalpeople/:id', authMiddleware, adminController.getBalUser)
router.post('/banpeople', authMiddleware, adminController.banUser)
router.post('/balpeople', authMiddleware, adminController.balUser)
router.post('/deleterew', authMiddleware, adminController.delRew)
//router.get('/auth', authMiddleware, UserController.check)



module.exports = router