const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user',{
    id: {type: DataTypes.INTEGER, primaryKey:true,autoIncrement:true},
    login:{type: DataTypes.STRING,unique: true},
    password:{type: DataTypes.STRING},
    email:{type: DataTypes.STRING,unique: true},
    avatar:{type: DataTypes.STRING},
    balance:{type: DataTypes.INTEGER},
    room:{type: DataTypes.INTEGER, defaultValue: 0},
    roomLvl:{type: DataTypes.INTEGER, defaultValue: 0},
    price:{type: DataTypes.INTEGER, defaultValue: 0},
    leader:{type: DataTypes.STRING, defaultValue: 0},
    useLeader:{type: DataTypes.INTEGER, defaultValue: 0},
    role :{type: DataTypes.STRING, defaultValue: 'USER'},
})

const UserInfoOpen = sequelize.define('user_info',{
    id: {type: DataTypes.INTEGER, primaryKey:true,autoIncrement:true},
    usId:{type: DataTypes.INTEGER,unique: true},
    login:{type: DataTypes.STRING,unique: true},
    avatar:{type: DataTypes.STRING, allowNull: false},
    code:{type: DataTypes.STRING, unique: true}, 
    name:{type: DataTypes.STRING},
    surname:{type: DataTypes.STRING},
    confLogin:{type: DataTypes.INTEGER}, 
    confPhoto:{type: DataTypes.INTEGER},
    confStat:{type: DataTypes.INTEGER},
})

const Rewiews = sequelize.define('rewiews',{
    id: {type: DataTypes.INTEGER, primaryKey:true,autoIncrement:true},
    usId:{type: DataTypes.INTEGER,unique: true},
    login:{type: DataTypes.STRING,unique: true, allowNull: false},
    avatar:{type: DataTypes.STRING, allowNull: false},
    text:{type: DataTypes.STRING, allowNull: false}, 
    date:{type: DataTypes.DATE, defaultValue: 0},
})
const Rooms = sequelize.define('rooms',{
    id: {type: DataTypes.INTEGER, primaryKey:true,autoIncrement:true}, 
    roomId:{type: DataTypes.INTEGER, allowNull: false},
    roomLvl:{type: DataTypes.INTEGER, allowNull: false},
    roomprice:{type: DataTypes.INTEGER, allowNull: false},
    countroomuser:{type: DataTypes.INTEGER, allowNull: false},
})
const firstLvl = sequelize.define('firstLvl',{
    id: {type: DataTypes.INTEGER, primaryKey:true,autoIncrement:true}, 
    countroomuser:{type: DataTypes.INTEGER},
    roomusers:{type: DataTypes.STRING, defaultValue: 0},
    price:{type: DataTypes.INTEGER, allowNull: false},
    binding2:{type: DataTypes.INTEGER, defaultValue: 0}, 
    binding3:{type: DataTypes.INTEGER, defaultValue: 0},
})
const secondLvl = sequelize.define('secondLvl',{
    id: {type: DataTypes.INTEGER, primaryKey:true,autoIncrement:true},  
    countroomuser:{type: DataTypes.INTEGER},
    roomusers:{type: DataTypes.STRING, allowNull: false},
    price:{type: DataTypes.INTEGER, allowNull: false},
    binding:{type: DataTypes.INTEGER, defaultValue: 0}, 
})
const thirdLvl = sequelize.define('thirdLvl',{
    id: {type: DataTypes.INTEGER, primaryKey:true,autoIncrement:true},  
    countroomuser:{type: DataTypes.INTEGER},
    roomusers:{type: DataTypes.STRING},
    price:{type: DataTypes.INTEGER, allowNull: false},
    binding:{type: DataTypes.INTEGER, defaultValue: 0}, 
})
const allStat = sequelize.define('allStat',{
    id: {type: DataTypes.INTEGER, primaryKey:true,autoIncrement:true}, 
    room1lvl:{type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}, 
    room2lvl:{type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    room3lvl:{type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    price:{type: DataTypes.INTEGER, allowNull: false}, 
})
const peopleStat = sequelize.define('peopleStat',{
    id: {type: DataTypes.INTEGER, primaryKey:true,autoIncrement:true}, 
    usId:{type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    input:{type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    output:{type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    rooms:{type: DataTypes.INTEGER, allowNull: false}, 
})

User.hasMany(Rooms)
Rooms.belongsTo(User)

User.hasOne(peopleStat)
peopleStat.belongsTo(User)

firstLvl.hasMany(allStat)
allStat.belongsTo(firstLvl)

secondLvl.hasMany(allStat)
allStat.belongsTo(secondLvl)

thirdLvl.hasMany(allStat)
allStat.belongsTo(thirdLvl)

Rooms.hasMany(firstLvl)
firstLvl.belongsTo(Rooms)

Rooms.hasMany(secondLvl)
secondLvl.belongsTo(Rooms)

Rooms.hasMany(thirdLvl)
thirdLvl.belongsTo(Rooms)

User.hasMany(UserInfoOpen, {as: 'info'});
UserInfoOpen.belongsTo(User)

User.hasOne(Rewiews)
Rewiews.belongsTo(User)

module.exports = {
    User,
    firstLvl,
    UserInfoOpen,
    Rewiews,
    Rooms,
    firstLvl,
    secondLvl,
    thirdLvl,
    allStat,
    peopleStat,
}