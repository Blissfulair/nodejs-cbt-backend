const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const db = require('../db/config')
const schema = new Schema({
    name:{
        type:String
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
module.exports = db.mk_user.model('cbt', schema)