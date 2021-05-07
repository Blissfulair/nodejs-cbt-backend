const {Model, DataTypes} = require('sequelize')
const db = require('../db/config')
class Activity extends Model{
}
Activity.init({
    reg_no:{
        type:DataTypes.STRING,
        allowNull:false
    },
    time_left:{
        type:DataTypes.DOUBLE,
        allowNull:false,
    },
    paper_type:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    day:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    mode:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
    },
    submitted:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
    },
},

{
    sequelize: db,
    modelName:'activities',
    // instanceMethods: {
    //     generateHash(password) {
    //         return bcrypt.hash(password, bcrypt.genSaltSync(8));
    //     },
    //     validPassword(password) {
    //         return bcrypt.compare(password, this.password);
    //     }
    // }
})


module.exports = Activity