const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {sendverifyEmail,resetPasswordEmail ,deleteProfileEmail}=require('../emails/account')

//Register User
router.post('/register',async (req,res)=>{
    delete req.body.isVerified
    const user = new User(req.body)
    //console.log(req.body)
    if(!req.body.password)
    {
        return res.status(400).send({msg:'Please Enter Password'})
    }
    try{
        //console.log(user._id,req.headers.host)
        const token = jwt.sign({_id : user._id.toString()},process.env.JWT_SECRET,{expiresIn:'900 seconds'})
        user.impToken=token
        await user.save()
        
        sendverifyEmail(user.email,user.name,req.headers.host,token)
        .then((result) => res.send({msg:"Congratulations User registered Successfully Please verify the Email",result}))
        .catch((error) => res.send({msg:"User registered Successfully unable to send the mail due to technical issues",error}));
    }catch(e){
        res.status(400).send({e,msg:'Please enter a unique username and Email'})
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
            return res.status(200).send({msg:"This account is already verified",key:100})
        }
        if(req.params.token != user.impToken)
        {
            return res.status(400).send({error:"Invalid Token or please Try again"})
        }
        user.isVerified = true;
        user.impToken=""
        await user.save() 
        res.send({msg:"Congralutaions!! Your account has been successfully verified",key:200})
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
        const token = jwt.sign({_id : user._id.toString()},process.env.JWT_SECRET,{expiresIn:'900 seconds'})
        user.impToken=token
        await user.save()
        sendverifyEmail(user.email,user.name,req.headers.host,token)
        .then((result) => res.send({result}))
        .catch((error) => res.send({error}));

    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/:token',auth,async(req,res)=>{
    try{
        const decoded = jwt.verify(req.params.token,process.env.JWT_SECRET)
        //const user = await User.findOne({_id:decoded._id})
        if(req.user._id!=decoded._id ||  req.params.token != req.user.impToken){
                return res.status(400).send({error:"Invalid Token unable to delete the profile"})
        }
        //console.log(decoded)
        await req.user.remove()
        res.send(req.user)

    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/deleteProfileMail',auth,async(req,res)=>{
    try{
        
        const token = jwt.sign({_id : req.user._id.toString()},process.env.JWT_SECRET,{expiresIn:'900 seconds'})
        req.user.impToken=token
        await req.user.save()
        deleteProfileEmail(req.user.email,req.user.name,req.headers.host,token)
        .then((result) => res.send({result}))
        .catch((error) => res.send({error}));
        
    }catch(e){
        res.status(400).send(e)
    }
})
//reset password //forgot password
router.post('/resetPasswordMail',async(req,res)=>{
    try{
        const user = await User.findOne({email:req.body.email})
        if (!user) {
            return res.status(400).send({ msg: 'We were unable to find a user with that email. Make sure your Email is correct!' });
        }
        const token = jwt.sign({_id : user._id.toString()},process.env.JWT_SECRET,{expiresIn:'900 seconds'})
        user.impToken=token
        await user.save()
        resetPasswordEmail(user.email,user.name,req.headers.host,token)
        .then((result) => res.send({result}))
        .catch((error) => res.send({error}));

    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/resetPassword/:token',async(req,res)=>{
    try{
        const decoded = jwt.verify(req.params.token,process.env.JWT_SECRET)
        const user = await User.findOne({_id:decoded._id})
        if(!user){
                return res.status(404).send({error:"user not found"})
        }
        if(!req.body.password){
             return res.status(400).send({error:"Please Enter Password"})
        }
        if(req.params.token != user.impToken)
        {
            return res.status(400).send({error:"Invalid Token or please Try again"})
        }
        user.password=req.body.password
        user.impToken=""
        await user.save()

        res.send({msg:"Congralutaions!! Your Password has been successfully updated"})
    }catch(e){
        res.status(400).send({e,error:"Invalid Token or please Try again"})
    }
   
})

//update  user
// as soon as person will login vishal will get all the data of that particular user on frontend then when ever he updates
//anything even array you will push data or pop data from array and send the update request by sending updated array in request body
//'repoCreated','groupJoined','pending','completed' remaning for update logic
router.patch('/users/me',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates =['name','domain','interest','identifiedAs','contact','social','description','profilePic', 'points','rank','contribution','saved']
    //console.log(updates,allowedUpdates)
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

router.get('/user/:id',async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
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