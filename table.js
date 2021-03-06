const {DataTypes, Sequelize} = require('sequelize')
module.exports = ()=>{
    return  {
        id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            autoIncrement:true,
            primaryKey:true
        },
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
        createdAt:{
            type:'TIMESTAMP',
            allowNull:false,
            defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt:{
            type:'TIMESTAMP',
            allowNull:false,
            defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
        },
    }
}