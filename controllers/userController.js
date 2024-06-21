const ApiError = require("../error/apiError")
const bcrypt = require('bcrypt')
const {User, UserInfoOpen, Rewiews, firstLvl, secondLvl, thirdLvl, Rooms, historyMoneyPopoln, historyMoneyvivod} = require('../models/models')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const path = require('path')
const { userInfo } = require("os")
const AWS = require('aws-sdk');
const e = require("cors")

const generateJWT = (id, login, email, balance,avatar, usname, ussurname, role, code, room, roomlvl, price, end, isBanned) => {
    if(isBanned){
        email = 'bannedUser'
        usname = 'bannedUser'
        ussurname = 'bannedUser'
        code = 'bannedUser'
        room = 'bannedUser'
        roomlvl = 'bannedUser'
        price = '0'
        balance = '0'
        end = 'bannedUser'
        avatar = 'prof.svg'
        return jwt.sign(
            {id, login, email, balance, avatar, usname, ussurname, role, code, room, roomlvl, price, end, isBanned}, 
            process.env.SECRET_KEY,
            {expiresIn: '24h'}
        )
    }
    return jwt.sign(
        {id, login, email, balance, avatar, usname, ussurname, role, code, room, roomlvl, price, end, isBanned}, 
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController{
    async registration(req,res, next){
        try {
            const s3 = new AWS.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION,
                endpoint: process.env.AWS_ENDPOINT, // добавляем endpoint
                s3ForcePathStyle: true // важно для использования кастомного endpoint
              });
            let {login, password, confpassword, email, role, code, flag } = req.body
            login = login.replace(/\s/g, '')
            email = email.replace(/\s/g, '')
            password = password.replace(/\s/g, '')
            if(login.length > 20){
                return next(ApiError.badRequest('Логин больше 20 символов'))
            }
            if(login.length < 4){
                return next(ApiError.badRequest('Логин меньше 4 символов'))
            }
            if(password.length < 4){
                return next(ApiError.badRequest('Пароль меньше 4 символов'))
            }
            if(password != confpassword){
                return next(ApiError.badRequest('Пароли не совпадают'))
            }
            if(email.length > 20){
                return next(ApiError.badRequest('Почта больше 20 символов'))
            }
            if(email.length < 4){
                return next(ApiError.badRequest('Почта меньше 4 символов'))
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
            console.log(file);
            fileName = uuid.v4() + ".jpg"
            const params = {
                Bucket: 'moneyslide',
                Key: fileName,
                Body: file.data,
                ContentType:'image/jpeg',
              };
              s3.upload(params, (err, data) => {
                if (err) {
                  return next(ApiError.badRequest(err.message))
                }
              });
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
            leadCode = cand.usId
        } 
        const user = await User.create({login: login, password: hashPassword, email: email, balance: 1000, avatar: fileName, role: role, leader: leadCode })
        const userInfo = await UserInfoOpen.create({usId:user.id, login: user.login, code: refCode, avatar: user.avatar, confLogin:null , confPhoto:null , confStat: null})
        const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price, user.end, user.isBanned)
        return res.json({token})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        
    }  
    async login(req,res,next){
        try{
            let {login, password} = req.body
            login = login.replace(/\s/g, '')
            password = password.replace(/\s/g, '')
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
            const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price, user.end, user.isBanned)
        return res.json({token})
            return res.json({token})}
        catch (e) {
                next(ApiError.badRequest(e.message))
            }
    }
    async check(req,res, next){
        try{
        let login = (req.user.login).replace(/\s/g, '')
        const user = await User.findOne({where:{login}}) 
        const userInfo = await UserInfoOpen.findOne({where:{login}})
        console.log(user);
        const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price, user.end, user.isBanned)
        return res.json({token})}
        catch (e) {
                next(ApiError.badRequest(e.message))
            }
    }
    async changeProfImg(req,res,next){
        try{
        const {login,id} = req.body
        const {file} = req.files
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
            endpoint: process.env.AWS_ENDPOINT, // добавляем endpoint
            s3ForcePathStyle: true // важно для использования кастомного endpoint
          });
        let fileName = uuid.v4() + ".jpg"
        const params = {
            Bucket: 'moneyslide',
            Key: fileName,
            Body: file.data,
            ContentType:'image/jpeg',
        };
        s3.upload(params, (err, data) => {
            if (err) {
                return next(ApiError.badRequest(err.message))
            }
        });
        await User.update({avatar:fileName},{where: {id}})
        const user = await User.findOne({where: {id}})
        const userInfo = await UserInfoOpen.findOne({where:{login: user.login}})
        await Rewiews.update({ avatar: fileName},{where: {usId : id}})
        const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price, user.end, user.isBanned)
        return res.json({token})}
        catch (e) {
            return next(ApiError.badRequest(e.message))
            }
    }
    async changeProfCommon(req,res,next){
        try{
            let {id,login,email,name,surname,refCode} = req.body
            login = login.replace(/\s/g, '')
            email = email.replace(/\s/g, '')
            refCode = refCode.replace(/\s/g, '')
            if(login.length > 20){
                return next(ApiError.badRequest('Логин больше 20 символов'))
            }
            if(login.length < 4){
                return next(ApiError.badRequest('Логин меньше 4 символов'))
            }
            if(email.length > 20){
                return next(ApiError.badRequest('Почта больше 20 символов'))
            }
            if(email.length < 4){
                return next(ApiError.badRequest('Почта меньше 4 символов'))
            }
            if(refCode.length > 40){
                return next(ApiError.badRequest('Пригласительный код больше 40 символов'))
            }
            if(refCode.length < 4){
                return next(ApiError.badRequest('Пригласительный код меньше 4 символов'))
            }
            if(name.length > 20){
                return next(ApiError.badRequest('Имя больше 20 символов'))
            }
            if(surname.length > 20){
                return next(ApiError.badRequest('Фамилия больше 20 символов'))
            }
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
            const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price, user.end, user.isBanned)
            return res.json({token})}
            catch (e) {
                return next(ApiError.badRequest(e.message))
                }
        
    }
    async changeProfSecurity(req,res,next){
        try{
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
            const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price, user.end, user.isBanned)
            return res.json({token})}
            catch (e) {
                return next(ApiError.badRequest(e.message))
                }
    }
    async changeProfOther(req,res,next){
        try{
            const {id,confLogin,confPhoto,confStat} = req.body
            const candidate = await User.findOne({where: {id}})
            await User.update({confLogin:confLogin,confPhoto:confPhoto,confStat:confStat},{where: {id}})
            const user = await User.findOne({where: {id}})
            const userInfo = await UserInfoOpen.findOne({where:{login: user.login}})
            const token = generateJWT(user.id, user.login, user.email, user.balance, user.avatar, userInfo.name, userInfo.surname, user.role, userInfo.code, user.room, user.roomLvl,user.price, user.end, user.isBanned)
            return res.json({token})}
            catch (e) {
                return next(ApiError.badRequest(e.message))
                }
    }
    async httpGetDiscount(req,res,next){
        try{
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
            return res.json({listUs})}
            catch (e) {
                return next(ApiError.badRequest(e.message))
                }
    }
    async getMyHistory(req,res, next){
        const { id } = req.query
        if (req.user) {
            if (req.user.id == id ) {
                const popoln = await historyMoneyPopoln.findAll(
                    {
                        where:{usId: id}
                    }
                )
                const vivod = await historyMoneyvivod.findAll(
                    {
                        where:{usId: id}
                    }
                )
                const mas = {
                    popoln: popoln,
                    vivod: vivod,
                }
                return res.json(mas)
            }
            return res.json('Вы запрапшиваете не вашу статистику')
        }
        return res.json('Вы запрапшиваете не вашу статистику')
    }
}

module.exports = new UserController()
