//require('dotenv').config();
const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const postRouter = require('./routers/posts')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(postRouter)

app.listen(port,()=>console.log('server is up on port '+port))