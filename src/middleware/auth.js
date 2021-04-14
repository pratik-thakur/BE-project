const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next)=>{
    //console.log('auth middleware')
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        //  console.log(token,process.env.JWT_SECRET)
        //console.log(jwt.verify(token,process.env.JWT_SECRET))
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
       // console.log(decoded,"2")
        const user = await User.findOne({_id:decoded._id,'tokens.token':token})
        //console.log(user,"3")
        if(!user){
            throw new Error("user not found")
        }
        req.token=token
        req.user=user
        next()

    }catch(e){
        res.status(401).send({error:'please authenticate',e})
    }
}
module.exports = auth