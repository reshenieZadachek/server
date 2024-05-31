const { User, UserInfoOpen, Rooms, firstLvl, secondLvl, thirdLvl, allStat } = require("../models/models")
const ApiError = require("../error/apiError")
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const sequelize = require('../db')

class RoomController{
    async getMy(req,res, next){
        const { id, price } = req.query
        const profile = await User.findOne(
            {
                attributes: ['id', 'room', 'roomLvl'],
                where: {id: id},

            },
        )
        let allUsersMyLvl = await User.findAll(
            {
                attributes: ['id', 'avatar'],
                where: {room: profile.room, roomLvl: profile.roomLvl, price: price},
            },
        )
        let mas = {
            firLvl: '',
            seclvl: '',
            thirlvl: '',
            roomlvl: profile.roomLvl, 
            price: ''
        } 
        if(profile.roomLvl == 1){
            mas.firLvl = allUsersMyLvl
            let myRoom = await firstLvl.findOne(
                {
                    attributes: ['id','price', 'binding2', 'binding3'],
                    where: {id: profile.room},
                },
            )
            mas.price = myRoom.price
            if(myRoom.binding2){
                const allUsers2Room = await User.findAll(
                    {
                        attributes: ['id', 'avatar'],
                        where: {room: myRoom.binding2, roomLvl: 2, price: price},
                    },
                )
                mas.seclvl = allUsers2Room
            }
            
            if(myRoom.binding3){
                const allUsers3Room = await User.findAll(
                    {
                        attributes: ['id', 'avatar'],
                        where: {room: myRoom.binding3, roomLvl: 3, price: price},
                    },
                )
                mas.thirlvl = allUsers3Room
            }
            return res.json(mas)
        } 
        else if(profile.roomLvl == 2){
            mas.seclvl = allUsersMyLvl
            const bindMyRoom = await secondLvl.findOne(
                {
                    attributes: ['id', 'binding'],
                    where: {id: profile.room},
                },
            )
            const bind1Room = await firstLvl.findOne(
                {
                    attributes: ['id', 'price', 'binding3'],
                    where: {id: bindMyRoom.binding},
                },
            )
            
            const allUsers1Lvl = await User.findAll(
                {
                    attributes: ['id', 'avatar'],
                    where: {room: bindMyRoom.binding, roomLvl: 1, price: price},
    
                },
            )
            mas.firLvl = allUsers1Lvl
            mas.price = bind1Room.price
            if(bind1Room.binding3){
                const bind3Room = await thirdLvl.findOne(
                    {
                        attributes: ['id', 'roomusers'],
                        where: {id: bind1Room.binding3},
                    },
                )
                const allUsers3Lvl = await User.findAll(
                    {
                        attributes: ['id', 'avatar'],
                        where: {id: bind3Room.roomusers, price: price},
                    },
                )
                mas.thirlvl = allUsers3Lvl;
            }
            return res.json(mas)
        }
        else if(profile.roomLvl == 3){
            mas.thirlvl = allUsersMyLvl
            const bindMyRoom = await thirdLvl.findOne(
                {
                    attributes: ['id', 'binding'],
                    where: {id: profile.room},
                },
            )
            const bind1Room = await firstLvl.findOne(
                {
                    attributes: ['id', 'price', 'binding2'],
                    where: {id: bindMyRoom.binding},
                },
            )
            mas.price = bind1Room.price
            const allUsers1Lvl = await User.findAll(
                {
                    attributes: ['id', 'avatar'],
                    where: {room: bindMyRoom.binding, roomLvl: 1, price: price},
    
                },
            )
            mas.firLvl = allUsers1Lvl
            if(bind1Room.binding2){
                const allUsers2Lvl = await User.findAll(
                    {
                        attributes: ['id', 'avatar'],
                        where: {room: bind1Room.binding2, roomLvl: 2, price: price},
                    },
                )
                mas.seclvl = allUsers2Lvl;
            }
            return res.json(mas)
        }
        return res.json(profile.roomLvl)
        
    }



    async joinRoom(req,res){
        const { id, price } = req.body
        let newPrice = parseInt(price)
        const profile = await User.findOne(
            {
                attributes: ['id', 'balance', 'room', 'roomLvl', 'leader', 'useLeader'],
                where: {id: id},
            },
        )
        if(profile.leader>0 && !profile.useLeader){
            newPrice = price - (price*0.1)
        }
        if(parseInt(profile.balance) >= parseInt(newPrice) && profile.room === 0){
            let newBalance = parseInt(profile.balance) - parseInt(newPrice)
           const emptyRoom = await firstLvl.findAndCountAll(
                {
                    attributes: ['id'],
                    where: {price: price, countroomuser: { [Op.lt]: 16}},
                },
            )

            const randRoomNum = Math.floor(Math.random() * (emptyRoom.count - 0) + 0)
            const randRoomId = emptyRoom.rows[randRoomNum].id
            const myNewRoom = await firstLvl.findOne(
                {
                    where: {id: randRoomId},
                },
            )
            let newRoomUsers = myNewRoom.roomusers
            if(newRoomUsers == '0'){
                newRoomUsers = ''
                newRoomUsers = '' + profile.id
            }
            else{
                newRoomUsers += ',' + profile.id
            }
            const check1lvlStat = await allStat.findOne(
                {
                    where: {price: parseInt(price)}
                }
            )
            if(check1lvlStat){
                const room1lvlconst = await allStat.findOne(
                    {
                        attributes: ['room1lvl'],
                        where: {price: price}
                    }
                )
                const newCount = room1lvlconst.room1lvl + 1
                await allStat.update({room1lvl: newCount},{where: {price: parseInt(price)}})
            }
            else{
                const room1lvlconst = await allStat.create({room1lvl: 0, room2lvl: 0, room1lvl: 0, price: parseInt(price)})
                const newCount = room1lvlconst.room1lvl + 1                           
                await allStat.update({room1lvl: newCount},{where: {price: parseInt(price)}})
            }
            const newCount = parseInt(myNewRoom.countroomuser) + 1
            if(parseInt(newCount) === 16){
                await User.update({ room: randRoomId, roomLvl: emptyRoom.rows[randRoomNum].roomLvl, balance: newBalance, useLeader: 1, price: price},{where: {id: profile.id}})
                await firstLvl.update({ roomusers: newRoomUsers, countroomuser: newCount},{where: {id: myNewRoom.id}})
                await Rooms.update({ countroomuser: newCount},{where: {roomId: myNewRoom.id}})

                let arr = newRoomUsers.split(',');
                let masRoom2Users = [];
                for (let i = 0; i < arr.length; i += 4) {
                    masRoom2Users.push(arr.slice(i, i + 4).join(','));
                }

                if(myNewRoom.binding3){
                    let idBind3Room = myNewRoom.binding3
                    let bind3Room = await thirdLvl.findOne(
                        {
                            attributes: ['id', 'roomusers'],
                            where: {id: idBind3Room},
                        },
                    )
                    let bind3RoomUser = await User.findOne(
                        {
                            attributes: ['id', 'balance', 'leader', 'useLeader'],
                            where: {id: bind3Room.roomusers},
                        },
                    )
                    if(bind3RoomUser.leader>0){
                        const oldBalance = await User.findOne(
                            {
                                attributes: ['id', 'balance'],
                                where: {id: bind3RoomUser.leader},
                            },
                        )
                        let leaderBalance = parseInt(oldBalance.balance) + parseInt(price)
                        await User.update({ balance: leaderBalance},{where: {id: bind3RoomUser.leader}})
                    }
                    const NewBalUs3 = bind3RoomUser.balance + (price*10)
                    await User.update({ balance: NewBalUs3, room: 0, roomLvl: 0, price:0 },{where: {id: bind3RoomUser.id}})
                    await thirdLvl.update({ roomusers: 0, countroomuser: 0, binding: 0 },{where: {id: idBind3Room}})

                    
                    
                }
                
                if(myNewRoom.binding2){
                    const idBind2Room = myNewRoom.binding2
                    const bind2Room = await secondLvl.findOne(
                        {
                            attributes: ['id', 'roomusers'],
                            where: {id: idBind2Room},
                        },
                    )
                    const myNewRoomUsersMas = (bind2Room.roomusers).split(',')
                    
                    for (let i = 0; i < 4; i++) {
                        const checkTirRoom = await thirdLvl.findOne(
                            {
                                where: {roomusers: '0', price: price},
                            },
                        )
                        let new3Room;
                        if (checkTirRoom) {
                            await thirdLvl.update({ countroomuser: 1, roomusers: myNewRoomUsersMas[i]},{where: {id: checkTirRoom.id}})
                            new3Room  = await thirdLvl.findOne(
                                {
                                    where: {id: checkTirRoom.id},
                                },
                            )
                        }
                        else{
                            new3Room = await thirdLvl.create({countroomuser: 1, roomusers: myNewRoomUsersMas[i], price: price, binding: 0})
                        }
                        await User.update({ room: new3Room.id, roomLvl: 3 },{where: {id: myNewRoomUsersMas[i]}})
                        await Rooms.create({roomId: new3Room.id, roomLvl: 3, roomprice: new3Room.price, countroomuser:new3Room.countroomuser})
                        let checkSpaceRoom1 = await firstLvl.findOne(
                            {
                                attributes: ['id', 'roomusers'],
                                where: {price: price, binding3: 0},
                            },
                        )
                        if(checkSpaceRoom1){
                            await firstLvl.update({ binding3: new3Room.id},{where: {id: checkSpaceRoom1.id}})
                            await thirdLvl.update({ binding: checkSpaceRoom1.id},{where: {id: new3Room.id}})
                        }
                        else{
                            let nowId = await  firstLvl.create({countroomuser: 0, roomusers: 0, price: price, binding2: 0, binding3: new3Room.id})
                            await Rooms.create({roomId: nowId.id, roomLvl: 1, roomprice: nowId.price, countroomuser:nowId.countroomuser})
                            await thirdLvl.update({ binding: nowId.id},{where: {id: new3Room.id}})
                        }
                        await secondLvl.update({ countroomuser: 0, roomusers: 0, binding: 0},{where: {id: idBind2Room}})
                        await firstLvl.update({ binding2: 0},{where: {binding2: idBind2Room}})
                        const check3lvlStat = await allStat.findOne(
                            {
                                where: {price: price}
                            }
                        )
                        if(check3lvlStat){
                            const room3lvlconst = await allStat.findOne(
                                {
                                    attributes: ['room3lvl'],
                                    where: {price: parseInt(price)}
                                }
                            )
                            const newCount = room3lvlconst.room3lvl + 1
                            await allStat.update({room3lvl: newCount},{where: {price: parseInt(price)}})
                        }
                        else{
                            const room3lvlconst = await allStat.create({room1lvl: 0, room2lvl: 0, room3lvl: 0, price: parseInt(price)})
                            const newCount = room3lvlconst.room3lvl + 1                        
                            await allStat.update({room3lvl: room3lvl+1},{where: {price: parseInt(price)}})
                        }

                        
                    }
                }
                
                for (let i = 0; i < 4; i++) {
                    const checkSecRoom = await secondLvl.findOne(
                        {
                            where: {roomusers: '0', price: price},
                        },
                    )
                    let new2Room;
                    if (checkSecRoom) {
                        await secondLvl.update({ countroomuser: 4, roomusers: masRoom2Users[i]},{where: {id: checkSecRoom.id}})
                        new2Room  = await secondLvl.findOne(
                            {
                                where: {id: checkSecRoom.id},
                            },
                        )
                    }
                    else{
                        new2Room = await secondLvl.create({countroomuser: 4, roomusers: masRoom2Users[i], price: price, binding: 0})
                    }
                    
                    await Rooms.create({roomId: new2Room.id, roomLvl: 2, roomprice: new2Room.price, countroomuser:new2Room.countroomuser})                    
                    let mas_id = masRoom2Users[i].split(',')
                    for (let e = 0; e < 4; e++) {
                        await User.update({ room: new2Room.id, roomLvl: 2 },{where: {id: mas_id[e]}})
                        const check2lvlStat = await allStat.findOne(
                            {
                                where: {price: parseInt(price)}
                            }
                        )
                        if(check2lvlStat){
                            const room2lvlconst = await allStat.findOne(
                                {
                                    attributes: ['room2lvl'],
                                    where: {price: parseInt(price)}
                                }
                            )
                            const newCount = room2lvlconst.room2lvl + 1
                            await allStat.update({room2lvl: newCount},{where: {price: parseInt(price)}})
                        }
                        else{
                            const room2lvlconst = await allStat.create({room1lvl: 0, room2lvl: 0, room3lvl: 0, price: parseInt(price)})  
                            const newCount = room2lvlconst.room2lvl + 1                          
                            await allStat.update({room2lvl: newCount},{where: {price: parseInt(price)}})
                        }
                        
                    }
                    let checkSpaceRoom1 = await firstLvl.findOne(
                        {
                            attributes: ['id', 'roomusers'],
                            where: {price: price, binding2: 0},
                        },
                    ) 
                    if(checkSpaceRoom1){
                        await firstLvl.update({ binding2: new2Room.id},{where: {id: checkSpaceRoom1.id}}) 
                        await secondLvl.update({ binding: checkSpaceRoom1.id},{where: {id: new2Room.id}})
                    }
                    else{
                        let nowId = await firstLvl.create({countroomuser: 0,roomusers: 0, price: price, binding2: new2Room.id, binding3: 0})
                        await Rooms.create({roomId: nowId.id, roomLvl: 1, roomprice: nowId.price, countroomuser:nowId.countroomuser})
                        await secondLvl.update({ binding: nowId.id},{where: {id: new2Room.id}})
                    }
                }
                await firstLvl.update({ countroomuser: 0, roomusers: 0},{where: {id: randRoomId}})
                await Rooms.update({ countroomuser: 0},{where: {roomId: randRoomId}})
                const user = await User.findOne(
                    {
                        attributes: ['id', 'balance', 'room', 'roomLvl'],
                        where: {id: profile.id},
                    },
                )
                let mas = {roomlvl: user.roomLvl, room: user.roomLvl, balance: user.balance, useLeader: 1, price: price ,mes:'Вы успешно вошли в комнату'}
                return res.json(mas)
            }  
            else{
                await User.update({ room: randRoomId, roomLvl: 1, price: price, balance: newBalance, useLeader: 1},{where: {id: profile.id}})
                await firstLvl.update({ roomusers: newRoomUsers, countroomuser: newCount},{where: {id: myNewRoom.id}})
                await Rooms.update({ countroomuser: newCount},{where: {roomId: myNewRoom.id}})
                const user = await User.findOne(
                    {
                        attributes: ['id', 'balance', 'room', 'roomLvl'],
                        where: {id: id},
                    },
                )
                let mas = {roomlvl: user.roomLvl, room: user.roomLvl, balance: user.balance, useLeader: 1, price: price ,mes:'Вы успешно вошли в комнату'}
                return res.json(mas)
            }
        }
        if(profile.room){
            return res.json('ВЫ СОСТОИТЕ В КОМНАТЕ')
        }
        if(parseInt(profile.balance) < parseInt(newPrice)){
            return res.json('НЕДОСТАТОЧНО СРЕДСТВ')
        }
        return res.json('ТЫ ЕБЕНЬ')
    }
    async testSetRoom(req,res){
        let mas = [1000, 2500, 5000, 10000]
        for (let i = 0; i < mas.length; i++) { 
            const room = await firstLvl.create({countroomuser: 0,roomusers: 0, price:mas[i], binding2: 0, binding3: 0})
            await Rooms.create({roomId: room.id,roomLvl: 1,roomprice: room.price, countroomuser:room.countroomuser})
        } 
        return res.json('ГОТОВО')
    }
    async testDELETE(req,res){
        await sequelize.drop()  
        return res.json('ГОТОВО')
    }
    async testSetUsers(req,res){
        let i = 0
        const password = '12345'
        
        while (i < 14) {
            let randRoomId = 7
            const myNewRoom = await firstLvl.findOne( 
                {
                    where: {id: randRoomId},
                },
            )
            let num = myNewRoom.countroomuser + 16
            let refCode = uuid.v4()
            const hashPassword = await bcrypt.hash(password, 5) 
            const user = await User.create({login: `login${num}`, password: hashPassword, email: `login${num}@gmail.com`, balance: 1000, avatar: 'e826f86a-6053-400d-a2b0-18714aba4aef.jpg', role: 'USER', leader: 0, room: randRoomId, roomLvl: 1, price: 1000})
            const userInfo = await UserInfoOpen.create({usId:user.id, login: user.login, code: refCode, avatar: user.avatar, confLogin:null , confPhoto:null , confStat: null})
            
            let newRoomUsers = myNewRoom.roomusers
            if(newRoomUsers == '0'){
                newRoomUsers = '' 
                newRoomUsers = '' + user.id 
            }
            else{
                newRoomUsers += ',' + user.id
            }
            let newCount = myNewRoom.countroomuser + 1
            await firstLvl.update({ roomusers: newRoomUsers, countroomuser: newCount},{where: {id: myNewRoom.id}})
            await Rooms.update({ countroomuser: newCount},{where: {roomId: myNewRoom.id}})
            i = myNewRoom.countroomuser
        } 
        return res.json('ГОТОВО')  
        
    }
    async testGETSECROOM(req,res){
        let idBind2Room = 7
        let users = await firstLvl.findOne(
            {
                attributes: ['id', 'countroomuser'],
                where: {id: idBind2Room}
            }
        )
        return res.json(`я работаю`)  
    }
}
 
module.exports = new RoomController() 
