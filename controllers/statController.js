const {  allStat } = require("../models/models")

class StatControler{
    async getStat(req,res){
	//return res.json('lol')
        const stat = await allStat.findAll()
        return res.json(stat)
    }
}

module.exports = new StatControler()
