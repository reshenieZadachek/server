const { sequelize, User, UserInfoOpen, historyMoneyPopoln, historyMoneyvivod } = require("../models/models")

class ProfileController{
    async getOne(req,res){
        const {id} = req.params
        const profile = await User.findOne(
            {
                attributes: ['id', 'login', 'avatar'],
                where: {id: id},
                //include: [{model: nameModel, as: 'info'}]
            },
        )
        const popoln = await historyMoneyPopoln.sum('value', { where: { usId: id } })
        const vivod = await historyMoneyvivod.sum('value', { where: { usId: id } })
        const mas = {profile:profile, historyPopoln: popoln, historyVivel: vivod}
        return res.json(mas)
    }
}

module.exports = new ProfileController()