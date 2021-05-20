const express = require('express')
const db = require('./db/config')
const fileUpload = require('express-fileupload');
const api = require('./routes/api')
const path = require('path')
const http = require('http')
const cors = require('cors')
const dotEnv = require('dotenv')
const socketIo = require('socket.io')
dotEnv.config()
db.sync()
.then(()=>console.log('db is connected'))
.catch(e=>console.log(e))
const app = express()
const server = http.createServer(app)
const websocket = socketIo(server,{
    allowEIO3: true,
    origins: ["https://exam.cbtservices.com.ng", "http://localhost:8080"],

    handlePreflightRequest: (req, res) => {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "https://exam.cbtservices.com.ng,http://localhost:8080",
        "Access-Control-Allow-Methods": "GET,POST, PATCH,OPTIONS, DELETE,PUT",
        "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
        "Access-Control-Allow-Credentials": true
      });
      res.end();
    }
})
app.use(fileUpload());
app.use(cors({origin:true}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, '')))

app.use('/api',api)
require('./middleware/socket')(websocket)
server.listen(5000, ()=>console.log('server is running on port 5000'))