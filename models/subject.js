const {Model, DataTypes} = require('sequelize')
const db = require('../db/config')

class Subject extends Model{}
Subject.init({
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    model:{
        type:DataTypes.STRING,
        allowNull:false,
    },
},
{
    sequelize: db,
    modelName:'subjects',
})
module.exports = Subject