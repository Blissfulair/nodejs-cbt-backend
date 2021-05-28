const mongoose = require('mongoose')
const Schema = mongoose.Schema;
schema = new Schema({
    reg_no:{
        type:String
    },
    day:{
        type:Number,
    },
    question_id:{
        type:String,
    },
    amount:{
        type:Number,
    },
    options:{
        type:String,
    },
    subject_id:{
        type:String,
    },
    answer:{
        type:Number,
        default:0
    },
    paper_type:{
        type:Number,
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

module.exports = mongoose.model('result', schema)