const {  allStat } = require("../models/models")

class StatControler{
    async getStat(req,res){
        const stat = await allStat.findAll()
        return res.json(stat)
    }
}

module.exports = new StatControler()