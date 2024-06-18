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
        if(text.length > 200){
            return next(ApiError.badRequest('Отзыв больше 200 символов'))
        }
        if(text.length < 10){
            return next(ApiError.badRequest('Отзыв меньше 10 символов'))
        }
        const candidate = await Rewiews.findOne({where: {login}})
        if(candidate){
            return next(ApiError.badRequest('Вы уже добавили отзыв'))
        }
        page = page || 1
        let limit = 3
        let offset = (page * limit - limit)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Месяцы в JavaScript начинаются с 0
        const day = String(today.getDate()).padStart(2, '0');

        const date = `${year}-${month}-${day}`;
        console.log(date);
        await Rewiews.create({usId: id,login: login,text: text, data: date, avatar: avatar})
        let allRew = await Rewiews.findAndCountAll({limit, offset})
        console.log(allRew);
        return res.json(allRew)
        
    }
}

module.exports = new RewiewsController()