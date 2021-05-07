const {Model, DataTypes} = require('sequelize')
const db = require('../db/config')

class Setting extends Model{}
Setting.init({
    type:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
    },
},
{
    sequelize: db,
    modelName:'settings',
    // instanceMethods: {
    //     generateHash(password) {
    //         return bcrypt.hash(password, bcrypt.genSaltSync(8));
    //     },
    //     validPassword(password) {
    //         return bcrypt.compare(password, this.password);
    //     }
    // }
})
module.exports = Setting