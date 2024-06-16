const ApiError = require("../error/apiError")
const {User, UserInfoOpen, Rewiews, firstLvl, secondLvl, thirdLvl, Rooms, historyMoneyPopoln, historyMoneyvivod} = require('../models/models')

class AdminController{
    async getBanUser(req,res,next){
        try{
            //let login = (req.user.login).replace(/\s/g, '')
            if (req.user) {
                if(req.user.role === 'ADMIN'){
                    const {id} = req.params
                    
                    const people = await User.findOne(
                        {
                            attributes: ['login', 'email', 'balance', 'isBanned'],
                            where: {id}
                        }
                    )
                    return res.json(people)
                }
                else{
                    return res.json('Вы не админ')
                }
            }
            else{
                return res.json('Вы не админ')
            }
        }catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async getBalUser(req,res,next){
        try{
            console.log('я тут');
            if (req.user) {
                if(req.user.role === 'ADMIN'){
                    const {id} = req.params
                    
                    const people = await User.findOne(
                        {
                            attributes: ['login', 'balance'],
                            where: {id}
                        }
                    )
                    return res.json(people)
                }
                else{
                    return res.json('Вы не админ')
                }
            }
            else{
                return res.json('Вы не админ')
            }
        }catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async banUser(req,res,next){
        try{
            if (req.user) {
                if(req.user.role === 'ADMIN'){
                    const { id, isBanned } = req.body
                    const banUser = await User.findOne(
                        {
                            attributes:['role'],
                            where: {id: id}
                        }
                        )
                    if(banUser.role === 'ADMIN'){
                        return res.json('Не пытайся забанить админа')
                    }
                    await User.update(
                        {
                            isBanned: isBanned
                        },
                        {
                            where: {id: id}
                        }
                        )
                    return res.json('Статус пользователя обновлен')
                }
                else{
                    return res.json('Вы не админ')
                }
            }
            else{
                return res.json('Вы не админ')
            }
        }catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async balUser(req,res,next){
        try{
            if (req.user) {
                if(req.user.role === 'ADMIN'){
                    const { id, plusBal, polsBal } = req.body
                    const newbalance = parseInt(polsBal) + parseInt(plusBal)
                    await User.update(
                        {
                            balance: newbalance
                        },
                        {
                            where: {id: id}
                        }
                        )
                    if(plusBal > 0){
                        await historyMoneyPopoln.create(
                            {usId: id, value: plusBal}
                        )
                    }
                    else if(plusBal < 0){
                        await historyMoneyvivod.create(
                            {usId: id, value: plusBal*(-1)}
                        )
                    }
                    return res.json('Баланс пользователя обновлен')
                }
                else{
                    return res.json('Вы не админ')
                }
            }
            else{
                return res.json('Вы не админ')
            }
        }catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async delRew(req,res,next){
        try{
            if (req.user) {
                if(req.user.role === 'ADMIN'){
                    const { id } = req.body
                    await Rewiews.destroy({
                        where: {
                          id: id
                        }
                      })
                    let limit = 3
                    let offset = (page * limit - limit)
                    let allRew = await Rewiews.findAndCountAll({limit, offset})
                    return res.json(allRew)
                }
                else{
                    return res.json('Вы не админ')
                }
            }
            else{
                return res.json('Вы не админ')
            }
        }catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new AdminController()
