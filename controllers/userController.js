const ApiError = require("../error/apiError")
const bcrypt = require('bcrypt')
const {User, UserInfoOpen, Rewiews, firstLvl, secondLvl, thirdLvl, Rooms} = require('../models/models')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const path = require('path')
const { userInfo } = require("os")
const e = require("cors")

const generateJWT = (id, login, email, balance,avatar, usname, ussurname, role, code, room, roomlvl, price) => {
    return jwt.sign(
        {id, login, email, balance, avatar, usname, ussurname, role, code, room, roomlvl, price}, 
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController{
    async registration(req,res, next){
        try {
            const {login, password, email, role, code, flag } = req.body
        if(!email || !password) {
            return next(ApiError.badRequest('Некорректный email или пароль'))
        }
        const candidate = await User.findOne({where: {login}})
        if(candidate){
            return next(ApiError.badRequest('Пользователь с таким логином уже существует'))
        }
	const candidate1 = await User.findOne({where: {email}})
        if(candidate1){
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        let fileName
        if(flag === 'true'){
            const {file} = req.files
            fileName = uuid.v4() + ".jpg"
            file.mv(path.resolve(__dirname, '..', 'static', fileName))
        }
        else{
            fileName = "prof.svg"
        }
        let refCode;
        while(true){
            refCode = uuid.v4()
            const checkCode = await UserInfoOpen.findOne({where: {code: refCode}})
            if(!checkCode){
                break
            }
        }
        const cand = await UserInfoOpen.findOne({where: {code: code}}) 
        let leadCode = 0;
        if(cand){
            leadCode = cand.id
        } 
        const user = await User.create({login: login, password: hashPassword, email: email, balance: 0, avatar: fileName, role: role, leader: leadCode })
        const userInfo = await UserInfoOpen.create({usId:user.id, login: user.login, code: refCode, avatar: user.avatar, confLogin:null , confPhoto:null , confStat: null})
        const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price)
        return res.json({token})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        
    }  
    async login(req,res,next){
        const {login, password} = req.body
        let user = await User.findOne({where:{login: login}})
        if(!user){
            user = await User.findOne({where:{email: login}})
            if(!user){
                return next(ApiError.internal('Пользователь не найден'))
            } 
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword){
            return next(ApiError.internal('Указан неверный пароль'))
        }
        const userInfo = await UserInfoOpen.findOne({where:{login: user.login}})
        const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price)
        return res.json({token})
    }
    async check(req,res, next){
        let login = req.user.login
        const user = await User.findOne({where:{login}}) 
        const userInfo = await UserInfoOpen.findOne({where:{login}})
        const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price)
        return res.json({token})
    }
    async changeProfImg(req,res,next){
        const {login,id} = req.body
        const {file} = req.files
        const userOld = await User.findOne({where: {id}})
        let fileName = uuid.v4() + ".jpg"
        file.mv(path.resolve(__dirname, '..', 'static', fileName))
        await User.update({avatar:fileName},{where: {id}})
        const user = await User.findOne({where: {id}})
        const userInfo = await UserInfoOpen.findOne({where:{login: user.login}})
        await Rewiews.update({ avatar: fileName},{where: {usId : id}})
        const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price)
        return res.json({token})
    }
    async changeProfCommon(req,res,next){
        
            const {id,login,email,name,surname,refCode} = req.body
            let candidate = await User.findOne({where: {login}})
            if(candidate){
                if(candidate.id != id){
                    return next(ApiError.badRequest('Пользователь с таким логином уже существует'))
                }
            }
            candidate = await User.findOne({where: {email}})
            if(candidate){
                if(candidate.id != id){
                    return next(ApiError.badRequest('Пользователь с такой почтой уже существует'))
                }
            }
            candidate = await UserInfoOpen.findOne({where: {code: refCode}})
            if(candidate){
                if(candidate.usId != id){
                    return next(ApiError.badRequest('Пользователь с таким кодом уже существует'))
                }
            }
            await User.update({login: login,email: email},{where: {id}})
            await UserInfoOpen.update({ login: login, name: name,surname: surname, code: refCode},{where: {usId : id}})
            await Rewiews.update({ login: login},{where: {usId : id}})
            const user = await User.findOne({where: {id}})
            const userInfo = await UserInfoOpen.findOne({where:{login: user.login}})
            const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price)
            return res.json({token})
        
    }
    async changeProfSecurity(req,res,next){
            const {id,password,nowPassword} = req.body
            const candidate = await User.findOne({where: {id}})
            let comparePassword = bcrypt.compareSync(nowPassword, candidate.password)
            if (!comparePassword){
                return next(ApiError.internal('Неверный текущий пароль'))
            }
            const hashPassword = await bcrypt.hash(password, 5)
            await User.update({password:hashPassword},{where: {id}})
            const user = await User.findOne({where: {id}})
            const userInfo = await UserInfoOpen.findOne({where:{login: user.login}})
            const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price)
            return res.json({token})
    }
    async changeProfOther(req,res,next){
            const {id,confLogin,confPhoto,confStat} = req.body
            const candidate = await User.findOne({where: {id}})
            await User.update({confLogin:confLogin,confPhoto:confPhoto,confStat:confStat},{where: {id}})
            const user = await User.findOne({where: {id}})
            const userInfo = await UserInfoOpen.findOne({where:{login: user.login}})
            const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price)
            return res.json({token})
    }
    async httpGetDiscount(req,res,next){
            const {id} = req.params
            let user = await User.findOne(
                {
                    attributes: ['leader', 'useLeader', 'room', 'roomLvl'],
                    where: {id},
                },
            )
            let users = 0;
            const roomlvl = user.roomLvl
            if (roomlvl === 0) {
                let listUs = {
                    user: user,
                    progress: 'Вы не вступили в группу'
                }
                return res.json({listUs})
            }
            else if (roomlvl === 1) {
                users = await firstLvl.findOne(
                    {
                        attributes: ['id', 'countroomuser'],
                        where: {id: user.room}
                    }
                )
            }
            else if(roomlvl === 2){
                const myRoom = await secondLvl.findOne(
                    {
                        attributes: ['id', 'binding'],
                        where: {id: user.room}
                    }
                )
                users = await firstLvl.findOne(
                    {
                        attributes: ['id', 'countroomuser'],
                        where: {id: myRoom.binding}
                    }
                )
            }
            else{
                const myRoom = await thirdLvl.findOne(
                    {
                        attributes: ['id', 'binding'],
                        where: {id: user.room}
                    }
                )
                users = await firstLvl.findOne(
                    {
                        attributes: ['id', 'countroomuser'],
                        where: {id: myRoom.binding}
                    }
                )
            }
            let listUs = {
                user: user,
                progress: users.countroomuser
            }
            return res.json({listUs})
    }
}

module.exports = new UserController()
