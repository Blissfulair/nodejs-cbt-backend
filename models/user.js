const mongoose =require('mongoose')
const Schema = mongoose.Schema;

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
    subject1:{
        type:String,
    },
    subject1_id:{
        type:String,
    },
    subject2:{
        type:String,
    },
    subject2_id:{
        type:String,
    },
    subject3:{
        type:String,
    },
    subject3_id:{
        type:String,
    },
    subject4:{
        type:String,
    },
    subject4_id:{
        type:String,
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
schema.on('init', (model)=>{})
module.exports = mongoose.model('user', schema)