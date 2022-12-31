const mongoose =require('mongoose')
const Schema = mongoose.Schema;
const db = require('../db/config')

const schema = new Schema({
    name:{
        type:String,
    },
    phone:{
        type:String,
    },
    email:{
        type:String,
        unique:true
    },
    reg_no:{
        type:String,
        unique:true
    },
    subjects:{
        type:Array,
    },
    subjectsID:{
        type:Array,
    },
    image:{
        type:String,
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
module.exports = db.mk_user.model('user', schema)