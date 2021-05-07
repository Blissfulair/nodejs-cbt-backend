const {Model, DataTypes, Sequelize} = require('sequelize')
const db = require('../db/config')

class Admin extends Model{}
Admin.init({
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    image:{
        type:DataTypes.STRING,
        allowNull:true
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
},
{
    sequelize: db,
    modelName:'admins',
})
module.exports = Admin