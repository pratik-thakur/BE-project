const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/users')
const {sendWelcomeEmail , sendCancelationEmail}=require('../emails/account')


//Register User
router.post('/register',async (req,res)=>{
    delete req.body.role
    const user = new User(req.body)
    //console.log(req.body)
    try{

        await user.save()
        if(user.email && user.name)
        {
            sendWelcomeEmail(user.email,user.name)
        }
        const token = await user.generateAuthToken()
        await user.addGamesToUser()
        
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})

//Login user
router.post('/login',async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.phoneNumber,req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user ,token })
    }catch(e){
        res.status(400).send(e)
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

router.delete('/users/me',auth,async(req,res)=>{
    try{
        //const user = await User.findByIdAndDelete(req.user._id)
        // if(!user)
        // return res.status(404).send()
        await req.user.remove()
        if(req.user.email && req.user.name)
        {
        sendCancelationEmail(req.user.email,req.user.name)
        }
        res.send(req.user)

    }catch(e){
        res.status(500).send()
    }
})
//update  user
router.patch('/users/me',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates =['name','email','password','age','location']
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
router.get('/users/me',auth,async(req,res)=>{

    res.send(req.user)
})

module.exports = router