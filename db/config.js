const mongoose = require('mongoose')
// const url = `mongodb+srv://givitec:givitec2020@cluster0.sd71d.mongonet/cbt?retryWrites=true&w=majority`;
const url = "mongodb://localhost:27017/user"
const url1 = "mongodb://localhost:27017/results"
const url2 = "mongodb://localhost:27017/admin"
const url3 = "mongodb://localhost:27017/questions"
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
mongoose.user = mongoose.createConnection(url,connectionParams)
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
mongoose.result = mongoose.createConnection(url1,connectionParams)
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
mongoose.admin = mongoose.createConnection(url2,connectionParams)
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
mongoose.questions = mongoose.createConnection(url3,connectionParams)
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
