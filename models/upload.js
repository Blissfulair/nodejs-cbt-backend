const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const schema = new Schema({
    file:{
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
module.exports = mongoose.model('upload', schema)