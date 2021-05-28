const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const schema  = new Schema({
    name:{
        type:String
    },
    model:{
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
module.exports = mongoose.model('subject', schema)