const {Model, DataTypes} = require('sequelize')
const db = require('../db/config')

class Cbt extends Model{}
Cbt.init({
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
},
{
    sequelize: db,
    modelName:'cbts',
})
module.exports = Cbt