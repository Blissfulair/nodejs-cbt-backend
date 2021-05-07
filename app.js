const express = require('express')
const db = require('./db/config')
const fileUpload = require('express-fileupload');
const api = require('./routes/api')
const path = require('path')
const cors = require('cors')
const dotEnv = require('dotenv')
dotEnv.config()
db.sync()
.then(()=>console.log('db is connected'))
.catch(e=>console.log(e))
const app = express()
app.use(fileUpload());
app.use(cors({origin:true}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, '')))

app.use('/api',api)
app.listen(5000, ()=>console.log('server is running on port 5000'))