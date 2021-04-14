const express = require('express')
require('./db/mongoose')
require('dotenv').config();
const userRouter = require('./routers/user')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)

app.listen(port,()=>console.log('server is up on port '+port))