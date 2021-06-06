const express = require('express')
const router = new express.Router()
const Posts = require('../models/posts')
const auth = require('../middleware/auth')

//create a Post
router.post('/post',auth,async(req,res)=>{
   const post = new Posts({
       ...req.body,
       author:req.user._id
   })
    try{
        await post.save()
        res.status(201).send(post)
    }catch(e){
        res.status(400).send(e)
    }

})

// read Post by id
router.get('/post/:id',async(req,res)=>{
    const _id = req.params.id
    try{
       const post = await Posts.findOne({_id})
       if(!post)
       return res.status(404).send()
       res.send(post)

    }catch(e){
        res.status(500).send()
    }
})

//Recent Post , all the post , Pagantion , post of a specific user
//GET /post?author=id
//GET/post?limit=10&skip=20
//Get/post?sortBy=cretedAt:desc  for recent post
router.get('/posts',async(req,res)=>{
    const match ={}
    const sort={}
    if(req.query.author)
    {
        match.author=req.query.author
    }
    if(req.query.sortBy){
        const parts=req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1:1
    }
    try{
       const posts=await Posts.find(match)
       .limit(parseInt(req.query.limit))
       .skip(parseInt(req.query.skip))
       .sort(sort)
        res.send(posts)
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/editPost/:id',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates =['title','body','tags']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidOperation)
    return res.status(400).send({error:'Invalid Updates!'})
    try{
        const post = await Posts.findOne({ _id:req.params.id ,author:req.user._id})
        if(!post){
            return res.status(404).send()
        }
        updates.forEach(update=>post[update]=req.body[update])
        await post.save()
        res.send(post)
    }catch(e){
        res.status(400).send(e)

    }
})

//['like','dislike','support','comments','numShare','numSave','rating']
// only rating left
router.patch('/updateComment/:id',auth,async(req,res)=>{

    try{
        const post = await Posts.findOne({ _id:req.params.id })
        if(!post){
            return res.status(404).send()
        }
        post.comments.map(comment => {
            // console.log(comment , req.body.id, req.user._id )
            // console.log(comment._id == req.body.id ,comment.user==req.user._id)
            // console.log(typeof(comment.user),typeof(req.user._id))
            if(comment._id == req.body.id && JSON.stringify(comment.user) == JSON.stringify(req.user._id))
            {
                //console.log(comment.comment)
                comment.comment = req.body.comment
                //console.log(comment.comment)
                
            }
        })
        await post.save()
        res.send(post)
    }catch(e){
        res.status(400).send(e)

    }
})

router.patch('/insertComment/:id',auth,async(req,res)=>{
    try{
        const post = await Posts.findOne({ _id:req.params.id })
        if(!post){
            return res.status(404).send()
        }
        post.comments.push({user:req.user._id,comment:req.body.comment})
        await post.save()
        res.send(post)
    }catch(e){
        res.status(400).send(e)

    }
})

router.patch('/deleteComment/:id',auth,async(req,res)=>{
    try{
        const post = await Posts.findOne({ _id:req.params.id })
        if(!post){
            return res.status(404).send()
        }
        if(req.user._id === post.author)
        {
            post.comments = post.comments.filter(comment => comment._id!=req.body.id)
        }
        else
        {
            post.comments = post.comments.filter(comment => (comment._id!=req.body.id || comment.user!=req.user._id))
        }
        await post.save()
        res.send(post)
    }catch(e){
        res.status(400).send(e)

    }
})

router.patch('/sharePost/:id',auth,async(req,res)=>{
    try{
        const post = await Posts.findOne({ _id:req.params.id })
        if(!post){
            return res.status(404).send()
        }
            const numsv = post.numShare +1
            post.numShare = numsv
            await post.save()
        res.send(post)
    }catch(e){
        res.status(400).send(e)
    }
})

router.patch('/savePost/:id',auth,async(req,res)=>{
    try{
        const post = await Posts.findOne({ _id:req.params.id })
        if(!post){
            return res.status(404).send()
        }
        const found = req.user.saved.some(id=>id===req.params.id)
        if(!found)
        {
            req.user.saved.push(req.user._id)
            const numsv = post.numSave +1
            post.numSave = numsv
            await post.save()
            await req.user.save()
        }
        
        res.send(post)
    }catch(e){
        res.status(400).send(e)
    }
})

router.patch('/likePost/:id',auth,async(req,res)=>{
    try{
        const post = await Posts.findOne({ _id:req.params.id })
        if(!post){
            return res.status(404).send()
        }
        const newdislike = post.dislike.filter(id => id!=req.user._id)
        post.dislike = newdislike
        const found = post.like.some(id=>id===req.user._id)
        if(!found)
        {
            post.like.push(req.user._id)
        }
        await post.save()
        res.send(post)
    }catch(e){
        res.status(400).send(e)
    }
})

router.patch('/dislikePost/:id',auth,async(req,res)=>{
    try{
        const post = await Posts.findOne({ _id:req.params.id })
        if(!post){
            return res.status(404).send()
        }
        const newlike = post.like.filter(id => id!=req.user._id)
        post.like = newlike
        const found = post.dislike.some(id=>id===req.user._id)
        if(!found)
        {
            post.dislike.push(req.user._id)
        }
        await post.save()
        res.send(post)
    }catch(e){
        res.status(400).send(e)
    }
})

router.patch('/supportPost/:id',auth,async(req,res)=>{
    try{
        const post = await Posts.findOne({ _id:req.params.id })
        if(!post){
            return res.status(404).send()
        }
        const found = post.support.some(id=>id===req.user._id)
        if(!found)
        {
            post.support.push(req.user._id)
        }
        await post.save()
        res.send(post)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/post/:id',auth,async(req,res)=>{
    try{
        const post = await Posts.findOneAndDelete({_id:req.params.id , author:req.user._id})
        if(!post)
        return res.status(404).send()
        res.send(post)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router