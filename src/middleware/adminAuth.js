const jwt = require('jsonwebtoken')
const User = require('../models/users')

const adminAuth = async (req,res,next)=>{
    //console.log('auth middleware')
    try{
        const token = req.header('Authorization').replace('Bearer ','')
      //  console.log(token,process.env.JWT_SECRET)
        //console.log(jwt.verify(token,process.env.JWT_SECRET))
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
       // console.log(decoded,"2")
        const user = await User.findOne({_id:decoded._id,'tokens.token':token,role:'Admin'})
        //console.log(user,"3")
        if(!user){
            throw new Error()
        }
        req.token=token
        req.user=user
        next()

    }catch(e){
        res.status(401).send({error:'please authenticate You are not an Admin ',e})
    }
}
module.exports = adminAuth