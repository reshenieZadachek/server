const { Rewiews } = require("../models/models")
const ApiError = require("../error/apiError")


class RewiewsController{
    async getRew(req,res){
        let {limit, page} = req.query
        page = page || 1
        limit = limit || 6
        let offset = (page * limit - limit)
        let allRew = await Rewiews.findAndCountAll({limit, offset})
        return res.json(allRew)
    }
    async postRew(req,res, next){
        let {id, login, text, avatar, page} = req.body
        const candidate = await Rewiews.findOne({where: {login}})
        if(candidate){
            return next(ApiError.badRequest('Вы уже добавили отзыв'))
        }
        page = page || 1
        let limit = 3
        let offset = (page * limit - limit)
        let date = new Date()
        date = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2) + ' ' + 
            ('00' + date.getUTCHours()).slice(-2) + ':' + 
            ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
            ('00' + date.getUTCSeconds()).slice(-2);
        const newRewiew = await Rewiews.create({usId: id,login: login,text: text, data: date, avatar: avatar})
        let allRew = await Rewiews.findAndCountAll({limit, offset})
        return res.json(allRew)
    }
}

module.exports = new RewiewsController()