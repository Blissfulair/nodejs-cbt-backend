const {Model, DataTypes} = require('sequelize')
const db = require('../db/config')

class Result extends Model{}
Result.init({
    reg_no:{
        type:DataTypes.STRING,
        allowNull:false
    },
    day:{
        type:DataTypes.INTEGER,
        allowNull:true,
    },
    question_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    amount:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    options:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    subject_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    answer:{
        type:DataTypes.STRING,
        defaultValue:0
    },
    paper_type:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
},
{
    sequelize: db,
    modelName:'result',
})

module.exports = Result