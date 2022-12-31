const mongoose = require('mongoose')
    const Schema = mongoose.Schema;
    const db = require('../db/config')
    
 
    const schema = new Schema({
        question:{
            type:String,
        },
        image:{
            type:String
        },
        a:{
            type:String,
        },
        b:{
            type:String,
        },
        c:{
            type:String,
        },
        d:{
            type:String,
        },
        answer:{
            type:String,
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
    module.exports = db.mk_questions.model('physics', schema)