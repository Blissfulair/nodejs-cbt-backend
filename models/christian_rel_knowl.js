const mongoose = require('mongoose')
    const Schema = mongoose.Schema;
    
 
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
    module.exports = mongoose.model('christian_rel_knowl', schema)