const mongoose = require('mongoose')
const Schema =mongoose.Schema;
const db = require('../db/config')
const schema = new Schema({
    name:{
        type:String,
    },
    phone:{
        type:String,
        allowNull:true,
    },
    email:{
        type:String,
        unique:true
    },
    image:{
        type:String,
        allowNull:true
    },
    password:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    }
})
module.exports = db.admin.model('admin', schema)