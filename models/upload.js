const {Model, DataTypes} = require('sequelize')
const db = require('../db/config')

class Upload extends Model{}
Upload.init({
    file:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:0
    },
},
{
    sequelize: db,
    modelName:'uploads',
    tableName:'uploads'
})
module.exports = Upload