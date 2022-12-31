const mongoose = require('mongoose')
// const url = `mongodb+srv://givitec:givitec2020@cluster0.sd71d.mongonet/cbt?retryWrites=true&w=majority`;
const url = "mongodb://127.0.0.1:27017/lapo_mk_user"
const url1 = "mongodb://127.0.0.1:27017/lapo_mk_results"
const url2 = "mongodb://127.0.0.1:27017/lapo_mk_admin"
const url3 = "mongodb://127.0.0.1:27017/lapo_mk_questions"
// const connectionParams={
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true 
// }
const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true ,
    poolSize:5
}
mongoose.mk_user = mongoose.createConnection(url,connectionParams)
// .then(async (e)=>{
//   try{
//     console.log('db is connected',e.db.databaseName)
//   }
//   finally{
//     // e.connection.close()
//   }
// })
// .catch(e=>{
//   console.log(e)
//   // process.exit(1)
// })
mongoose.mk_result = mongoose.createConnection(url1,connectionParams)
// .then(async (e)=>{
//     try{
//       console.log('db is connected',e.db.databaseName)
//     }
//     finally{
//       // e.connection.close()
//     }
//   })
//   .catch(e=>{
//     console.log(e)
//     // process.exit(1)
//   })
mongoose.mk_admin = mongoose.createConnection(url2,connectionParams)
// .then(async (e)=>{
//     try{
//       console.log('db is connected',e.db.databaseName)
//       e.db.dropCollection('upload', (err,res)=>{
//         console.log(err, 'rr')
//         console.log(res,'result')
//     })
//     }
//     finally{
//       // e.connection.close()
//     }
//   })
//   .catch(e=>{
//     console.log(e)
//     // process.exit(1)
//   })
mongoose.mk_questions = mongoose.createConnection(url3,connectionParams)
// .then(async (e)=>{
//     try{
//       console.log('db is connected',e.db.databaseName)
//     }
//     finally{
//       // e.connection.close()
//     }
//   })
//   .catch(e=>{
//     console.log(e)
//     // process.exit(1)
//   })

module.exports = mongoose
