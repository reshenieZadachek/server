const Router = require('express')
const router = new Router
const userRouter = require('./userRouter')
const profileRouter = require('./profileRouter')
const roomRouter = require('./roomRouter')
const RewiewsRouter = require('./RewiewsRouter')
const statRouter = require('./statRouter')
const adminRouter = require('./adminRouter')

router.use('/user', userRouter)
router.use('/profile', profileRouter)
router.use('/rewiews', RewiewsRouter)
router.use('/room', roomRouter)
router.use('/admin', adminRouter)
router.use('/st', statRouter)
module.exports = router
