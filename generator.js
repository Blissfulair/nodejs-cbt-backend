module.exports = (name)=>{
    return`const {Model, DataTypes} = require('sequelize')
    const db = require('../db/config')
    
    class ${name.replace(/\s/g, '').replace(/[.]/g, '_').replace(/[-]/g,'')} extends Model{}
    ${name.replace(/\s/g, '').replace(/[.]/g, '_').replace(/[-]/g,'')}.init({
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
        modelName:'${name.toLowerCase().replace(/[.]/g,'').replace(/\s/g, '_').replace(/[-]/g,'_')}',
        tableName:'${name.toLowerCase().replace(/[.]/g,'').replace(/\s/g, '_').replace(/[-]/g,'_')}'
    })
    module.exports = ${name.replace(/\s/g, '').replace(/[.]/g, '_').replace(/[-]/g,'')}`
}