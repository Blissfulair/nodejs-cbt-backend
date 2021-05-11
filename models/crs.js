const {Model, DataTypes} = require('sequelize')
    const db = require('../db/config')
    
    class CRS extends Model{}
    CRS.init({
        question:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        image:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        a:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        b:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        c:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        d:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        answer:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        paper_type:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
    },
    {
        sequelize: db,
        modelName:'crs',
        tableName:'crs'
    })
    module.exports = CRS