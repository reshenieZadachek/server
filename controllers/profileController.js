const { User, UserInfoOpen } = require("../models/models")

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
        return res.json(profile)
    }
}

module.exports = new ProfileController()