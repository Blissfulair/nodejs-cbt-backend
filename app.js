const express = require('express')
const db = require('./db/config')
const fileUpload = require('express-fileupload');
const api = require('./routes/api')
const web = require('./routes/web')
const path = require('path')
const http = require('http')
const cors = require('cors')
const dotEnv = require('dotenv')



dotEnv.config()

const app = express()
const server = http.createServer(app)
app.use(cors())


app.use(fileUpload());

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, '')))


app.use('/api',api)
app.use(web)
// require('./middleware/socket')(websocket)
server.listen(process.env.PORT,'127.0.0.1', ()=>console.log(` 
        ###       ###
      ######    ######
    ######### #########
   http://localhost:${process.env.PORT}
    ######### #########
      ######    ######
        ###       ###
        
    `))