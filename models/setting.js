const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const schema = new Schema({
    type:{
        type:String,
        default:0
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
module.exports = mongoose.model('setting', schema)