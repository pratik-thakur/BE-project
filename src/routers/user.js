const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {sendverifyEmail }=require('../emails/account')

//Register User
router.post('/register',async (req,res)=>{
    delete req.body.isVerified
    const user = new User(req.body)
    //console.log(req.body)
    try{
        //console.log(user._id,req.headers.host)
        await user.save()    
        sendverifyEmail(user.email,user.name,req.headers.host,user._id)
        .then((result) => res.send({user, result}))
        .catch((error) => res.send({user,error}));
    }catch(e){
        res.status(400).send(e)
    }
})

//Login user
router.post('/login',async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        if(!user.isVerified)
        {
            return res.status(401).send({error:"Please verify your Email"})
        }
        const token = await user.generateAuthToken()
        res.send({ user ,token })
    }catch(e){
        res.status(400).send({e,"error":"Invalid Email or Password"})
    }
})

router.post('/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()

    }
})

router.get('/confirmation/:token',async(req,res)=>{
    try{
        const decoded = jwt.verify(req.params.token,process.env.JWT_SECRET)
        const user = await User.findOne({_id:decoded._id})
        if(!user){
                return res.status(404).send({error:"user not found"})
               // console.log("xsxsx")
        }
        if(user.isVerified)
        {
            return res.status(200).send({msg:"This account is already verified"})
        }
        user.isVerified = true;
        await user.save() 
        res.send({msg:"Congralutaions!! Your account has been successfully verified"})
    }catch(e){
        res.status(400).send({e,error:"Invalid Token please regenerate the verification link"})
    }
   
})

router.post('/resendVerificationLink',async(req,res)=>{
    try{
        const user = await User.findOne({email:req.body.email})
        if (!user) {
            return res.status(400).send({ msg: 'We were unable to find a user with that email. Make sure your Email is correct!' });
        }
        else if (user.isVerified) {
            return res.status(200).send({msg:'This account has been already verified. Please log in.'});
        }
        sendverifyEmail(user.email,user.name,req.headers.host,user._id)
        .then((result) => res.send({user, result}))
        .catch((error) => res.send({user,error}));

    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me',auth,async(req,res)=>{
    try{
        //const user = await User.findByIdAndDelete(req.user._id)
        // if(!user)
        // return res.status(404).send()
        await req.user.remove()
        // if(req.user.email && req.user.name)
        // {
        // sendCancelationEmail(req.user.email,req.user.name)
        // }
        res.send(req.user)

    }catch(e){
        res.status(500).send()
    }
})
//update  user
router.patch('/users/me',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates =['name','password','domain','interest','identifiedAs']
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid Updates!'})
    }
    try{
        //const user = await User.findById(req.params.id)
        updates.forEach(update=>{
            req.user[update]=req.body[update]
        })
        await req.user.save()
        //const user = await User.findByIdAndUpdate(req.params.id,req.body , {new:true, runValidators:true})
        // if(!user){
        //     return res.status(404).send()
        // }
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

//get profile
router.get('/users/:username',async(req,res)=>{
    try{
        const user = await User.findOne({username:req.params.username})
        if(!user)
        {
            return res.status(404).send({error:"User not found"})
        }
        res.send(user)
    }catch(e)
    {
        res.status(400).send({e,error:"User not found"})
    }
    
})

module.exports = router