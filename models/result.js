const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const db = require('../db/config')
schema = new Schema({
    reg_no:{
        type:String,
        index:true,
        sparse:true
    },
    day:{
        type:String,
    },
    name:{
        type:String,
    },
    amount:{
        type:Number,
    },
    subject1:{
        type:Array,
    },
    subject2:{
        type:Array,
    },
    subject3:{
        type:Array,
    },
    subject4:{
        type:Array,
    },
    details:{
        type:Object
    },
    paper_type:{
        type:Number,
    },
    submitted:{
        type:Number,
        default:0
    },
    answered:{
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

module.exports = db.result.model('result', schema)