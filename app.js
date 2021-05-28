const express = require('express')
const db = require('./db/config')
const fileUpload = require('express-fileupload');
const api = require('./routes/api')
const web = require('./routes/web')
const path = require('path')
const http = require('http')
const cors = require('cors')
const dotEnv = require('dotenv')
const mongoose = require('mongoose')
const socketIo = require('socket.io')


dotEnv.config()
// db.sync()
// .then(()=>console.log('db is connected'))
// .catch(e=>console.log(e))
mongoose.connect(db.url,db.connectionParams)
.then(()=>console.log('db is connected'))
.catch(e=>console.log(e))
const app = express()
const server = http.createServer(app)
app.use(cors())
const websocket = socketIo(server,{
    allowEIO3: true,
    // origins: ["*"],

    // handlePreflightRequest: (req, res) => {
    //   res.writeHead(200, {
    //     "Access-Control-Allow-Origin": "*",
    //     "Access-Control-Allow-Methods": "GET,POST, PATCH,OPTIONS, DELETE,PUT",
    //     "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
    //     "Access-Control-Allow-Credentials": true
    //   });
    //   res.end();
    // }
})

app.use(fileUpload());

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, '')))


app.use('/api',api)
app.use(web)
// require('./middleware/socket')(websocket)
server.listen(5000, ()=>console.log(` 
        ###       ###
      ######    ######
    ######### #########
   http://localhost:5000
    ######### #########
      ######    ######
        ###       ###
        
    `))