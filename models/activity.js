const mongoose = require('mongoose');
const db = require('../db/config')
const Schema = mongoose.Schema;

const schema = new Schema({
    reg_no:{
        type:String
    },
    time_left:{
        type:Number,
    },
    paper_type:{
        type:Number,
    },
    day:{
        type:String,
    },
    mode:{
        type:Number,
        default:0
    },
    submitted:{
        type:Number,
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

// module.exports = async()=>{
//     console.log('here')
//     await db.user.model('activity', schema)
// }
module.exports = db.user.model('activity', schema)