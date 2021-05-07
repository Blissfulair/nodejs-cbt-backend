const {Model, DataTypes, Sequelize} = require('sequelize')

const db = require('../db/config')
const Activity = require('./activity')

class User extends Model{}
User.init({
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
    reg_no:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    subject1:{
        type:DataTypes.STRING,
        allowNull:true
    },
    subject1_id:{
        type:DataTypes.SMALLINT,
        allowNull:true
    },
    subject2:{
        type:DataTypes.STRING,
        allowNull:true
    },
    subject2_id:{
        type:DataTypes.SMALLINT,
        allowNull:true
    },
    subject3:{
        type:DataTypes.STRING,
        allowNull:true
    },
    subject3_id:{
        type:DataTypes.SMALLINT,
        allowNull:true
    },
    subject4:{
        type:DataTypes.STRING,
        allowNull:true
    },
    subject4_id:{
        type:DataTypes.SMALLINT,
        allowNull:true
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
    modelName:'users',
    // instanceMethods: {
    //     generateHash(password) {
    //         return bcrypt.hash(password, bcrypt.genSaltSync(8));
    //     },
    //     validPassword(password) {
    //         return bcrypt.compare(password, this.password);
    //     }
    // }
})
User.associate =()=>{
    User.hasMany(Activity, {targetKey:'reg_no',foreignKey:'reg_no'})
}
module.exports = User